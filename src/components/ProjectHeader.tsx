import { Link } from '@/i18n/routing';
import { Button } from './ui/button';
import { ArrowLeft, User, School } from 'lucide-react';
import Image from 'next/image';

/**
 * Props for the ProjectHeader component.
 */
interface ProjectHeaderProps {
    /** Project title in current locale */
    title: string;
    /** Project description in current locale */
    description: string;
    /** Project category */
    category: string;
    /** Name of the project author */
    authorName: string;
    /** Name of the school/institution */
    schoolName: string;
    /** Optional instructor name (overrides authorName when provided) */
    instructorName?: string | null;
    /** URL to the hero/background image */
    heroImageUrl?: string | null;
}

/**
 * Hero header section for project detail pages.
 * 
 * Features a full-width hero section with:
 * - Background image overlay (or gradient fallback)
 * - Category badge
 * - Project title and description
 * - Author/instructor and school information
 * - Back to gallery navigation
 * 
 * @param props - Component props
 */
export default function ProjectHeader({
    title,
    description,
    category,
    authorName,
    schoolName,
    instructorName,
    heroImageUrl,
}: ProjectHeaderProps) {
    return (
        <header className="relative w-full bg-slate-900 text-white overflow-hidden">
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 z-0">
                {heroImageUrl ? (
                    <Image
                        src={heroImageUrl}
                        alt={title}
                        fill
                        unoptimized // For placehold.co SVG support
                        className="object-cover opacity-40 mix-blend-overlay"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 opacity-80" />
                )}
            </div>

            <div className="relative z-10 container mx-auto px-4 py-20 sm:py-32 max-w-4xl">
                <Link href="/">
                    <Button variant="ghost" className="text-white hover:bg-white/10 mb-8 -ml-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Gallery
                    </Button>
                </Link>

                <div className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-sm font-medium bg-white/10 backdrop-blur-md mb-6">
                    {category}
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                    {title}
                </h1>

                <p className="text-lg sm:text-xl text-slate-200 mb-8 max-w-2xl leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-wrap gap-6 text-sm sm:text-base font-medium text-slate-300">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {instructorName || authorName}
                    </div>
                    <div className="flex items-center gap-2">
                        <School className="h-5 w-5" />
                        {schoolName}
                    </div>
                </div>
            </div>
        </header>
    );
}
