'use client';

import { Step } from '@/lib/api/projects';
import CodeSnippet from './CodeSnippet';
import Image from 'next/image';
import { useState } from 'react';
import ImageModal from './ImageModal';

/**
 * Props for the StepList component.
 */
interface StepListProps {
    /** Array of project steps to display */
    steps: Step[];
    /** Current locale for displaying multilingual content */
    locale: string;
}

/**
 * Displays project steps in a vertical timeline layout.
 * 
 * Features:
 * - Vertical timeline with numbered dots
 * - Responsive alternating card layout (desktop) / stacked (mobile)
 * - Step images with zoom-in modal
 * - Code snippets with syntax highlighting
 * - Automatic locale-based content selection with English fallback
 * 
 * Shows a placeholder message if no steps are provided.
 * 
 * @param props - Component props
 */
export default function StepList({ steps, locale }: StepListProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!steps || steps.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground italic bg-slate-50 rounded-xl border border-dashed">
                No steps documented for this project yet.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ms-5 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {steps.map((step, index) => (
                    <div key={step.id} className="relative flex items-start gap-4 group is-active">

                        {/* Timeline Dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 shadow shrink-0 text-slate-500 font-bold z-10 transition-colors group-hover:bg-primary group-hover:text-white mt-1">
                            {step.step_number}
                        </div>

                        {/* Card — takes all remaining horizontal space */}
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="prose prose-slate max-w-none dark:prose-invert">
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                    {step.title?.[locale] || step.title?.['en'] || `Step ${step.step_number}`}
                                </h3>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                                    {step.content[locale] || step.content['en'] || 'Step instructions missing.'}
                                </p>
                            </div>

                            {step.image_url && (
                                <div
                                    className="mt-6 relative h-64 w-full rounded-xl overflow-hidden bg-slate-100 border cursor-zoom-in group/image"
                                    onClick={() => setSelectedImage(step.image_url)}
                                >
                                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors z-10 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                                        <span className="bg-white/90 text-slate-700 text-xs px-2 py-1 rounded shadow">Click to expand</span>
                                    </div>
                                    <Image
                                        src={step.image_url}
                                        alt={`Step ${step.step_number}`}
                                        fill
                                        unoptimized // For placehold.co SVG support
                                        className="object-cover transition-transform duration-500 group-hover/image:scale-105"
                                    />
                                </div>
                            )}

                            {step.code_snippet && (
                                <CodeSnippet code={step.code_snippet} />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ImageModal
                isOpen={!!selectedImage}
                imageSrc={selectedImage || ''}
                onClose={() => setSelectedImage(null)}
            />
        </>
    );
}
