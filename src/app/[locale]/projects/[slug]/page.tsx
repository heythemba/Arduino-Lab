import { getProjectBySlug } from '@/lib/api/projects';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProjectHeader from '@/components/ProjectHeader';
import StepList from '@/components/StepList';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/ShareButton';
import { Download, Share2, Code, Box, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import CommentSection from '@/components/comments/CommentSection';

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

/**
 * Generates metadata for the project detail page for SEO and social sharing.
 * 
 * Fetches the project by slug and constructs appropriate page title and description
 * using the correct locale. Falls back to English if the requested locale is unavailable.
 * 
 * @param params - Route parameters containing locale and slug
 * @returns Metadata object with title and description
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
        return { title: 'Project Not Found' };
    }

    return {
        title: `${project.title[locale] || project.title['en']} | ArduinoLab`,
        description: project.description[locale] || project.description['en'],
    };
}

/**
 * Project detail page displaying complete project information.
 * 
 * Shows:
 * - Project header with hero image and metadata
 * - Step-by-step tutorial instructions
 * - Downloadable resources (code files, 3D models, other attachments)
 * - Share functionality
 * 
 * Organized by file type with appropriate icons and download buttons.
 * Returns 404 if the project slug is not found.
 * 
 * @param params - Route parameters
 */
export default async function ProjectPage({ params }: Props) {
    const { slug, locale } = await params;
    const t = await getTranslations('ProjectDetails');
    const project = await getProjectBySlug(slug);

    if (!project) {
        notFound();
    }

    const title = project.title[locale] || project.title['en'];
    const description = project.description[locale] || project.description['en'];

    return (
        <main className="flex-1 bg-white">
            <ProjectHeader
                title={title}
                description={description}
                category={project.category}
                authorName={project.author.full_name}
                schoolName={project.school_name || project.author.school_name}
                instructorName={project.instructor_name}
                heroImageUrl={project.hero_image_url}
            />

            <div className="mx-auto w-[90%] md:w-[80%] py-16">
                {/* Main Content: Steps */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-10 pb-4 border-b">
                        <div className="w-2 h-8 bg-primary rounded-full" />
                        <h2 className="text-2xl font-bold text-slate-900">{t('stepByStep')}</h2>
                    </div>

                    <StepList steps={project.steps} locale={locale} />
                </div>

                {/* Bottom Section: Downloads & Info */}
                <div className="space-y-8 pt-12 border-t">
                    <div className="bg-slate-50 p-8 rounded-3xl border">
                        <h3 className="font-bold text-2xl mb-6 text-slate-900">{t('resources')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Code Files */}
                            {project.attachments?.filter(a => a.file_type === 'ino').length > 0 && (
                                <div className="col-span-1 md:col-span-2">
                                    <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('code')}</h4>
                                    <div className="space-y-2">
                                        {project.attachments.filter(a => a.file_type === 'ino').map(file => (
                                            <a key={file.id} href={file.file_url} target="_blank" rel="noopener noreferrer" className="block">
                                                <Button variant="outline" className="w-full justify-start h-auto py-3 gap-3 border-slate-200 hover:border-blue-300 hover:bg-blue-50">
                                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                                        <Code className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                                        <span className="font-semibold text-sm truncate w-full">{file.file_name}</span>
                                                        <span className="text-xs text-muted-foreground">{file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'External Link'}</span>
                                                    </div>
                                                    <Download className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 3D Models */}
                            {project.attachments?.filter(a => a.file_type === 'stl').length > 0 && (
                                <div className={project.attachments?.filter(a => !['ino', 'stl'].includes(a.file_type)).length === 0 ? "col-span-1 md:col-span-2" : ""}>
                                    <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('models')}</h4>
                                    <div className="space-y-2">
                                        {project.attachments.filter(a => a.file_type === 'stl').map(file => (
                                            <a key={file.id} href={file.file_url} target="_blank" rel="noopener noreferrer" className="block">
                                                <Button variant="outline" className="w-full justify-start h-auto py-3 gap-3 border-slate-200 hover:border-orange-300 hover:bg-orange-50">
                                                    <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                                                        <Box className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                                        <span className="font-semibold text-sm truncate w-full">{file.file_name}</span>
                                                        <span className="text-xs text-muted-foreground">{file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(1)} MB` : 'External Link'}</span>
                                                    </div>
                                                    <Download className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Other Files */}
                            {project.attachments?.filter(a => !['ino', 'stl'].includes(a.file_type)).length > 0 && (
                                <div className={project.attachments?.filter(a => a.file_type === 'stl').length === 0 ? "col-span-1 md:col-span-2" : ""}>
                                    <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Other Resources</h4>
                                    <div className="space-y-2">
                                        {project.attachments.filter(a => !['ino', 'stl'].includes(a.file_type)).map(file => (
                                            <a key={file.id} href={file.file_url} target="_blank" rel="noopener noreferrer" className="block">
                                                <Button variant="outline" className="w-full justify-start h-auto py-3 gap-3">
                                                    <div className="bg-slate-100 text-slate-600 p-2 rounded-lg">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                                        <span className="font-semibold text-sm truncate w-full">{file.file_name}</span>
                                                    </div>
                                                </Button>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {(!project.attachments || project.attachments.length === 0) && (
                            <div className="text-center py-6 text-slate-500 bg-slate-100 rounded-xl">
                                <p className="text-sm">No downloadable resources added yet.</p>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t flex justify-center">
                            <ShareButton label={t('share')} copiedLabel={t('copied')} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-slate-50 border-t border-slate-200">
                <div className="mx-auto w-[90%] md:w-[80%] py-16">
                    <CommentSection projectId={project.id} locale={locale} />
                </div>
            </div>

        </main >
    );
}
