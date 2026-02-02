import { getProjectBySlug } from '@/lib/api/projects';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProjectHeader from '@/components/ProjectHeader';
import StepList from '@/components/StepList';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

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

export default async function ProjectPage({ params }: Props) {
    const { slug, locale } = await params;
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
                schoolName={project.author.school_name}
                heroImageUrl={project.hero_image_url}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content: Steps */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-4 mb-10 pb-4 border-b">
                            <div className="w-2 h-8 bg-primary rounded-full" />
                            <h2 className="text-2xl font-bold text-slate-900">Step-by-Step Guide</h2>
                        </div>

                        <StepList steps={project.steps} locale={locale} />
                    </div>

                    {/* Sidebar: Downloads & Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-slate-50 p-6 rounded-2xl border sticky top-24">
                            <h3 className="font-bold text-lg mb-4 text-slate-900">Project Resources</h3>
                            <div className="space-y-4">
                                <Button className="w-full justify-start h-auto py-4" size="lg">
                                    <Download className="mr-3 h-5 w-5" />
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-bold">Download Code</span>
                                        <span className="text-xs opacity-80 font-normal">.ino file (coming soon)</span>
                                    </div>
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-auto py-4" size="lg">
                                    <div className="mr-3 h-5 w-5 flex items-center justify-center font-bold border-2 border-current rounded text-[10px]">3D</div>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="font-bold">Download 3D Models</span>
                                        <span className="text-xs opacity-80 text-muted-foreground font-normal">.stl files (coming soon)</span>
                                    </div>
                                </Button>
                            </div>

                            <div className="mt-8 pt-8 border-t">
                                <Button variant="ghost" className="w-full justify-center">
                                    <Share2 className="mr-2 h-4 w-4" /> Share Project
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </main>
    );
}
