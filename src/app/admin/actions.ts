'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Creates a new user (Leader) manually.
 * 
 * This action is restricted to Admins. It uses the Supabase Admin API (Service Role)
 * to bypass the default public registration restrictions (if any) and auto-confirms
 * the user's email.
 * 
 * @param prevState - The previous state of the form action (for error handling).
 * @param formData - The form data containing email, password, etc.
 */
export async function createUser(prevState: any, formData: FormData) {
    const email = (formData.get('email') as string).trim();
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('password_confirm') as string;
    const fullName = formData.get('full_name') as string;
    const role = (formData.get('role') as string) || 'volunteer_facilitator';

    const ALLOWED_ROLES = ['volunteer_facilitator', 'teacher'];
    if (!ALLOWED_ROLES.includes(role)) {
        return { message: 'Invalid role selected.' };
    }

    // 1. Basic Validation
    if (!email || !password || !fullName) {
        return { message: 'All fields are required.' };
    }

    if (password !== passwordConfirm) {
        return { message: 'Passwords do not match.' };
    }

    if (password.length < 6) {
        return { message: 'Password must be at least 6 characters.' };
    }

    // 2. Create Admin Client
    // We need the Service Role Key to create users directly without email verification flow.
    // WARNING: This client bypasses Row Level Security (RLS). Use with caution.
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // 3. Create User in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Automatically confirm email so they can login immediately
        user_metadata: {
            full_name: fullName,
            role: role
        }
    });

    if (error) {
        console.error('Create User Error:', error);
        return { message: error.message };
    }

    // 4. Revalidate execution to refresh the user list
    revalidatePath('/[locale]/admin', 'page');
    return { success: true, message: `User ${email} created successfully!` };
}

/**
 * Creates a new project with steps and attachments.
 * 
 * This supports multilingual titles/content and handles transaction-like behavior
 * (manual rollback) if step/attachment insertion fails.
 * 
 * @param prevState - Previous form state.
 * @param formData - Form data including JSON strings for steps and attachments.
 */
export async function createProject(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Authentication Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Unauthorized' }
    }

    // 2. Role Check & Client Selection
    // If the user is an Admin, we upgrade to the Service Role client to ensure
    // they can create content without hitting any restrictive RLS (though typically creation is allowed).
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.role === 'admin';
    const clientToUse = isAdmin ? createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    ) : supabase;

    // 3. Extract & Format Data
    const rawFormData = Object.fromEntries(formData.entries());

    // Construct JSONB objects for multilingual fields
    const title = {
        en: formData.get('title_en'),
        fr: formData.get('title_fr'),
        ar: formData.get('title_ar')
    };

    const description = {
        en: formData.get('description_en'),
        fr: formData.get('description_fr'),
        ar: formData.get('description_ar')
    };

    const category = formData.get('category');
    const slug = formData.get('slug');
    const hero_image_url = formData.get('hero_image_url');
    const instructor_name = String(formData.get('instructor_name') || '').substring(0, 20);
    const school_name = String(formData.get('school_name') || '').substring(0, 20);

    // 4. Insert Main Project Record
    const { data: project, error: projectError } = await clientToUse
        .from('projects')
        .insert({
            title,
            description,
            category,
            slug,
            hero_image_url,
            instructor_name,
            school_name,
            is_published: true, // Projects are live by default
            author_id: user.id
        })
        .select()
        .single();

    if (projectError) {
        console.error('Project Insert Error:', projectError);
        return { message: `Failed to create project: ${projectError.message}` };
    }

    // 5. Insert Steps (Transaction-like Rollback)
    const stepsJson = formData.get('steps_json');
    if (stepsJson) {
        try {
            const steps = JSON.parse(stepsJson as string);

            if (steps.length > 0) {
                const formattedSteps = steps.map((step: any, index: number) => ({
                    project_id: project.id,
                    step_number: index + 1,
                    title: step.title,
                    content: step.content,
                    image_url: step.image_url
                }));

                const { error: stepsError } = await clientToUse
                    .from('project_steps')
                    .insert(formattedSteps);

                if (stepsError) {
                    console.error('Steps Insert Error:', stepsError);

                    // CRITICAL: Rollback - Delete the project if steps fail
                    await clientToUse.from('projects').delete().eq('id', project.id);

                    return { message: `Project creation failed (rolled back): ${stepsError.message}` };
                }
            }
        } catch (e: any) {
            console.error('Unexpected Error:', e);
            await clientToUse.from('projects').delete().eq('id', project.id);
            return { message: `Unexpected error: ${e.message}` };
        }
    }

    // 6. Insert Attachments
    const attachmentsJson = formData.get('attachments_json');
    if (attachmentsJson) {
        try {
            const attachments = JSON.parse(attachmentsJson as string);
            if (attachments.length > 0) {
                const formattedAttachments = attachments.map((att: any) => ({
                    project_id: project.id,
                    file_type: att.file_type,
                    file_name: att.file_name,
                    file_url: att.file_url,
                    file_size: att.file_size
                }));

                const { error: attError } = await clientToUse
                    .from('project_attachments')
                    .insert(formattedAttachments);

                if (attError) {
                    console.error('Attachments Insert Error:', attError);
                    // Rollback on attachment failure to keep data clean
                    await clientToUse.from('projects').delete().eq('id', project.id);
                    return { message: `Attachments creation failed: ${attError.message}` };
                }
            }
        } catch (e: any) {
            console.error('Attachments Error:', e);
            await clientToUse.from('projects').delete().eq('id', project.id);
            return { message: `Attachments error: ${e.message}` };
        }
    }

    // 7. Refresh Data
    revalidatePath('/[locale]/admin', 'page');
    revalidatePath('/[locale]/projects', 'page');

    return { success: true, message: 'Project created successfully!' };
}

/**
 * Deletes a project by ID.
 * 
 * Admins can delete ANY project.
 * Leaders can only delete THEIR OWN projects.
 */
export async function deleteProject(projectId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Unauthorized' }
    }

    // Check User Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Elevate privileges for Admin
    const isAdmin = profile?.role === 'admin';
    const clientToUse = isAdmin ? createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    ) : supabase;

    let query = clientToUse
        .from('projects')
        .delete()
        .eq('id', projectId);

    // If NOT admin, strict ownership check is applied
    if (!isAdmin) {
        query = query.eq('author_id', user.id);
    }

    const { error } = await query;

    if (error) {
        return { message: error.message };
    }

    revalidatePath('/[locale]/admin', 'page');
    revalidatePath('/[locale]/projects', 'page');
    revalidatePath('/', 'layout');

    return { success: true };
}

/**
 * Updates an existing project.
 * 
 * Handles metadata updates and performs a "DELETE & REPLACE" strategy
 * for steps and attachments to ensure synchronization.
 */
export async function updateProject(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: 'Unauthorized' };
    }

    const projectId = formData.get('id') as string;
    if (!projectId) return { message: 'Project ID missing' };

    // Check Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Elevate privileges for Admin to allow editing others' projects
    const isAdmin = profile?.role === 'admin';
    const clientToUse = isAdmin ? createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    ) : supabase;

    // Extract form data
    const title = {
        en: formData.get('title_en'),
        fr: formData.get('title_fr'),
        ar: formData.get('title_ar')
    };

    const description = {
        en: formData.get('description_en'),
        fr: formData.get('description_fr'),
        ar: formData.get('description_ar')
    };

    const category = formData.get('category');
    const slug = formData.get('slug');
    const hero_image_url = formData.get('hero_image_url');
    const instructor_name = String(formData.get('instructor_name') || '').substring(0, 20);
    const school_name = String(formData.get('school_name') || '').substring(0, 20);

    // 1. Update Project Metadata
    let updateQuery = clientToUse
        .from('projects')
        .update({
            title,
            description,
            category,
            slug,
            hero_image_url,
            instructor_name,
            school_name,
            updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

    // Ownership check for non-admins
    if (!isAdmin) {
        updateQuery = updateQuery.eq('author_id', user.id);
    }

    const { error: projectError } = await updateQuery;

    if (projectError) {
        return { message: `Failed to update project: ${projectError.message}` };
    }

    // 2. Handle Steps (Strategy: Delete All + Re-insert)
    // This is simpler than differencing and ensures clean slate.
    const stepsJson = formData.get('steps_json');
    if (stepsJson) {
        try {
            const steps = JSON.parse(stepsJson as string);

            // DELETE existing steps
            const { error: deleteError } = await clientToUse
                .from('project_steps')
                .delete()
                .eq('project_id', projectId);

            if (deleteError) {
                console.error('Failed to delete old steps:', deleteError);
                return { message: 'Failed to update steps.' };
            }

            // INSERT new steps
            if (steps.length > 0) {
                const formattedSteps = steps.map((step: any, index: number) => ({
                    project_id: projectId,
                    step_number: index + 1,
                    title: step.title,
                    content: step.content,
                    image_url: step.image_url
                }));

                const { error: stepsError } = await clientToUse
                    .from('project_steps')
                    .insert(formattedSteps);

                if (stepsError) {
                    console.error('Steps Insert Error:', stepsError);
                    return { message: `Steps update failed: ${stepsError.message}` };
                }
            }
        } catch (e: any) {
            console.error('Unexpected Error:', e);
            return { message: `Unexpected error: ${e.message}` };
        }
    }

    // 3. Handle Attachments (Strategy: Delete All + Re-insert)
    const attachmentsJson = formData.get('attachments_json');
    if (attachmentsJson) {
        try {
            const attachments = JSON.parse(attachmentsJson as string);

            // DELETE existing attachments
            const { error: deleteAttError } = await clientToUse
                .from('project_attachments')
                .delete()
                .eq('project_id', projectId);

            if (deleteAttError) {
                console.error('Failed to delete old attachments:', deleteAttError);
                return { message: 'Failed to update attachments.' };
            }

            // INSERT new attachments
            if (attachments.length > 0) {
                const formattedAttachments = attachments.map((att: any) => ({
                    project_id: projectId,
                    file_type: att.file_type,
                    file_name: att.file_name,
                    file_url: att.file_url,
                    file_size: att.file_size
                }));

                const { error: attError } = await clientToUse
                    .from('project_attachments')
                    .insert(formattedAttachments);

                if (attError) {
                    console.error('Attachments Insert Error:', attError);
                    return { message: `Attachments update failed: ${attError.message}` };
                }
            }
        } catch (e: any) {
            console.error('Attachments Error:', e);
            return { message: `Attachments error: ${e.message}` };
        }
    }

    revalidatePath('/[locale]/admin', 'page');
    revalidatePath('/[locale]/projects', 'page');
    revalidatePath(`/[locale]/projects/${slug}`, 'page');

    return { success: true, message: 'Project updated successfully!' };
}
