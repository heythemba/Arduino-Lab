'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ProjectDocument } from '@/components/ProjectPDF';
import { imageUrlToBase64 } from '@/utils/imageToBase64';
import { FullProject } from '@/lib/api/projects';

type ProjectPdfButtonProps = {
    /** The full project data */
    project: FullProject;
    /** Current locale for content */
    locale: string;
    /** Localized label text for the download button */
    label: string;
};

/**
 * PDF download button that generates a PDF containing the project content.
 *
 * Uses @react-pdf/renderer to create a text-layer rich PDF without taking DOM snapshots.
 *
 * @param props - Component props
 */
export default function ProjectPdfButton({
    project,
    locale,
    label
}: ProjectPdfButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);

        try {
            // Convert step images to base64
            const stepsWithImages = await Promise.all(
                (project.steps || []).map(async (step) => ({
                    ...step,
                    imageBase64: await imageUrlToBase64(step.image_url ?? null),
                }))
            );

            // Convert cover image to base64
            const coverImageBase64 = await imageUrlToBase64(project.hero_image_url ?? null);

            // Create blob from the React PDF component
            const blob = await pdf(
                <ProjectDocument
                    project={{ ...project, steps: stepsWithImages, coverBase64: coverImageBase64 }}
                    locale={locale}
                />
            ).toBlob();

            // Setup download URL and trigger click
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Clean filename
            const title = project.title?.[locale] || project.title?.['en'] || 'Project';
            a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'download'}.pdf`;
            
            // Trigger download
            a.click();
            
            // Cleanup
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert(`Failed to generate PDF. Please try again later.\n\nError details: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="ghost"
            className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            onClick={generatePDF}
            disabled={isGenerating}
        >
            {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileText className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : label}
        </Button>
    );
}