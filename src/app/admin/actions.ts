'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProject(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Unauthorized' }
    }

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

    // 1. Insert Project
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
            title,
            description,
            category,
            slug,
            hero_image_url,
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

                const { error: stepsError } = await supabase
                    .from('project_steps')
                    .insert(formattedSteps);

                if (stepsError) {
                    console.error('Steps Insert Error:', stepsError);

                    // ROLLBACK: Delete the created project
                    await supabase.from('projects').delete().eq('id', project.id);

                    return { message: `Project creation failed (rolled back): ${stepsError.message}` };
                }
            }
        } catch (e: any) {
            // JSON parse error or other unexpected error
            console.error('Unexpected Error:', e);
            await supabase.from('projects').delete().eq('id', project.id);
            return { message: `Unexpected error: ${e.message}` };
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

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('author_id', user.id); // Ensure user owns the project

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

    // 1. Update Project Metadata
    const { error: projectError } = await supabase
        .from('projects')
        .update({
            title,
            description,
            category,
            slug,
            hero_image_url,
            updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('author_id', user.id); // Ensure ownership

    if (projectError) {
        return { message: `Failed to update project: ${projectError.message}` };
    }

    // 2. Handle Steps (Delete All + Re-insert Strategy)
    const stepsJson = formData.get('steps_json');
    if (stepsJson) {
        try {
            const steps = JSON.parse(stepsJson as string);

            // DELETE existing steps
            const { error: deleteError } = await supabase
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

                const { error: stepsError } = await supabase
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

    revalidatePath('/[locale]/admin', 'page');
    revalidatePath('/[locale]/projects', 'page');
    revalidatePath(`/[locale]/projects/${slug}`, 'page'); // Revalidate detail page

    return { success: true, message: 'Project updated successfully!' };
}
