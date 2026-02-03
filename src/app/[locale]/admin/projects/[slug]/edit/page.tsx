import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Link from 'next/link';
import ProjectForm from '@/components/admin/ProjectForm';
import { updateProject } from '@/app/admin/actions';

export default async function EditProjectPage({
    params
}: {
    params: Promise<{ locale: string; slug: string }>
}) {
    const { locale, slug } = await params;
    const t = await getTranslations('ProjectForm'); // Re-use Create Project translations where possible

    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    // 2. Fetch Project Data
    const { data: project, error } = await supabase
        .from('projects')
        .select(`
            *,
            steps:project_steps(*),
            attachments:project_attachments(*)
        `)
        .eq('slug', slug)
        .eq('author_id', user.id) // Ensure ownership
        .single();

    if (error || !project) {
        console.error('Error fetching project for edit:', error);
        console.error('Debug params:', { slug, userId: user.id });
        notFound();
    }

    // 3. Transform Data for Form
    // The DB returns simple JSON objects for title/description, but TypeScript might need casting
    // Steps need to be sorted
    const sortedSteps = (project.steps || []).sort((a: any, b: any) => a.step_number - b.step_number);

    const initialData = {
        id: project.id,
        slug: project.slug,
        category: project.category,
        hero_image_url: project.hero_image_url,
        instructor_name: project.instructor_name,
        school_name: project.school_name,
        title: project.title as any,
        description: project.description as any,
        steps: sortedSteps.map((s: any) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            image_url: s.image_url
        })),
        attachments: project.attachments || []
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 font-[family-name:var(--font-geist-sans)]">
            <div className="container max-w-4xl mx-auto px-4">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Edit Project</h1>
                    {/* Using hardcoded 'Edit Project' or add key to translations later */}

                    <Link href={`/${locale}/admin`}>
                        <Button variant="ghost">
                            <X className="h-4 w-4 mr-2" /> {t('cancel')}
                        </Button>
                    </Link>
                </div>

                <ProjectForm
                    locale={locale}
                    action={updateProject}
                    initialData={initialData}
                    isEditMode={true}
                />

            </div>
            {/* Spacer for fixed footer */}
            <div className="h-24"></div>
        </div>
    );
}
