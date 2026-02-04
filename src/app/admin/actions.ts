'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { getLocale } from 'next-intl/server'



import { createClient as createAdminClient } from '@supabase/supabase-js'


export async function createUser(prevState: any, formData: FormData) {
    const email = (formData.get('email') as string).trim();
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('password_confirm') as string;
    const fullName = formData.get('full_name') as string;

    if (!email || !password || !fullName) {
        return { message: 'All fields are required.' };
    }

    if (password !== passwordConfirm) {
        return { message: 'Passwords do not match.' };
    }

    if (password.length < 6) {
        return { message: 'Password must be at least 6 characters.' };
    }

    // Create Admin Client (bypass RLS)
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

    // Create User with confirmed email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm
        user_metadata: {
            full_name: fullName
        }
    });

    if (error) {
        console.error('Create User Error:', error);
        return { message: error.message };
    }

    revalidatePath('/[locale]/admin', 'page');
    return { success: true, message: `User ${email} created successfully!` };
}

export async function createProject(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Unauthorized' }
    }

    // Check Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Use Admin Client if user is admin, otherwise use standard client
    const isAdmin = profile?.role === 'admin';
    const clientToUse = isAdmin ? createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    ) : supabase;

    // Extract form data
    const rawFormData = Object.fromEntries(formData.entries());

    // Construct Title/Description JSONB
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

    // 1. Insert Project
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
            is_published: true, // Publish by default
            author_id: user.id
        })
        .select()
        .single();

    if (projectError) {
        console.error('Project Insert Error:', projectError);
        return { message: `Failed to create project: ${projectError.message}` };
    }

    // 2. Insert Steps (with Rollback on Failure)
    const stepsJson = formData.get('steps_json');
    if (stepsJson) {
        try {
            const steps = JSON.parse(stepsJson as string);

            if (steps.length > 0) {
                const formattedSteps = steps.map((step: any, index: number) => ({
                    project_id: project.id,
                    step_number: index + 1,
                    title: step.title, // {en, fr, ar} - Requires DB Migration!
                    content: step.content, // {en, fr, ar}
                    image_url: step.image_url
                }));

                const { error: stepsError } = await clientToUse
                    .from('project_steps')
                    .insert(formattedSteps);

                if (stepsError) {
                    console.error('Steps Insert Error:', stepsError);

                    // ROLLBACK: Delete the created project
                    await clientToUse.from('projects').delete().eq('id', project.id);

                    return { message: `Project creation failed (rolled back): ${stepsError.message}` };
                }
            }
        } catch (e: any) {
            // JSON parse error or other unexpected error
            console.error('Unexpected Error:', e);
            await clientToUse.from('projects').delete().eq('id', project.id);
            return { message: `Unexpected error: ${e.message}` };
        }
    }

    // 3. Insert Attachments
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
                    // Optional: Rollback or just partial success warning? 
                    // Let's rollback to be safe
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

    revalidatePath('/[locale]/admin', 'page');
    revalidatePath('/[locale]/projects', 'page');

    return { success: true, message: 'Project created successfully!' };
}

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

    // Use Admin Client if user is admin check
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

    // If NOT admin, enforce ownership check
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

    // Use Admin Client if user is admin
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

    // If NOT admin, enforce ownership check
    if (!isAdmin) {
        updateQuery = updateQuery.eq('author_id', user.id);
    }

    const { error: projectError } = await updateQuery;

    if (projectError) {
        return { message: `Failed to update project: ${projectError.message}` };
    }

    // 2. Handle Steps (Delete All + Re-insert Strategy)
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

    // 3. Handle Attachments (Delete All + Re-insert Strategy)
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
    revalidatePath(`/[locale]/projects/${slug}`, 'page'); // Revalidate detail page

    return { success: true, message: 'Project updated successfully!' };
}
