import { Link } from '@/i18n/routing';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface ProjectCardProps {
    title: string;
    description: string;
    imageUrl?: string;
    slug: string;
    category?: string;
}

export default function ProjectCard({ title, description, imageUrl, slug, category = "Robotics" }: ProjectCardProps) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50">
            {/* Image Placeholder */}
            <div className="aspect-video w-full bg-muted relative overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        unoptimized // For placehold.co SVG support
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-200">
                        <span className="text-4xl font-bold opacity-20">LOGO</span>
                    </div>
                )}
                <div className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    {category}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">{title}</h3>
                <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                    {description}
                </p>

                <Link href={`/projects/${slug}`}>
                    <Button variant="ghost" className="w-full justify-between hover:bg-blue-50 hover:text-blue-600 group-hover:translate-x-1 transition-transform">
                        View Project
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
