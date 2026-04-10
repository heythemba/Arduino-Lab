'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Step } from '@/lib/api/projects';

type ProjectPdfButtonProps = {
    /** Project title for the PDF filename */
    projectTitle: string;
    /** Project description */
    projectDescription: string;
    /** Project steps */
    steps: Step[];
    /** Current locale for content */
    locale: string;
    /** Localized label text for the download button */
    label: string;
};

/**
 * PDF download button that generates a PDF containing the project content.
 *
 * Creates a formatted PDF with:
 * - Project title and description
 * - Step-by-step instructions with images and preserved text formatting
 * - Full support for Arabic, French, and English text with proper rendering
 * - Downloads with project name as filename
 *
 * @param props - Component props
 */
export default function ProjectPdfButton({
    projectTitle,
    projectDescription,
    steps,
    locale,
    label
}: ProjectPdfButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);

        try {
            // Wait for document fonts to load
            if (document.fonts) {
                await document.fonts.ready;
            }

            // Create a temporary container for rendering content
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-10000px';
            container.style.top = '-10000px';
            container.style.width = '210mm'; // A4 width
            container.style.padding = '20mm';
            container.style.backgroundColor = 'white';
            // Use fonts that have excellent Arabic support
            container.style.fontFamily = "Tahoma, 'Arial Unicode MS', Arial, sans-serif";
            container.style.lineHeight = '1.6';
            container.style.direction = locale === 'ar' ? 'rtl' : 'ltr';
            container.style.textAlign = locale === 'ar' ? 'right' : 'left';
            container.style.fontSize = '14px';
            container.style.color = '#000000';

            // Add title
            const titleElement = document.createElement('h1');
            titleElement.style.fontSize = '32px';
            titleElement.style.fontWeight = 'bold';
            titleElement.style.marginBottom = '15px';
            titleElement.style.marginTop = '0';
            titleElement.style.color = '#1a1a1a';
            titleElement.style.fontFamily = "Tahoma, 'Arial Unicode MS', Arial, sans-serif";
            titleElement.textContent = projectTitle;
            container.appendChild(titleElement);

            // Add description
            if (projectDescription) {
                const descElement = document.createElement('p');
                descElement.style.fontSize = '14px';
                descElement.style.marginBottom = '20px';
                descElement.style.marginTop = '0';
                descElement.style.lineHeight = '1.6';
                descElement.style.fontFamily = "Tahoma, 'Arial Unicode MS', Arial, sans-serif";
                descElement.textContent = projectDescription;
                container.appendChild(descElement);
            }

            // Add steps
            if (steps && steps.length > 0) {
                const stepsHeaderElement = document.createElement('h2');
                stepsHeaderElement.style.fontSize = '22px';
                stepsHeaderElement.style.fontWeight = 'bold';
                stepsHeaderElement.style.marginTop = '25px';
                stepsHeaderElement.style.marginBottom = '15px';
                stepsHeaderElement.style.paddingTop = '10px';
                stepsHeaderElement.style.borderTop = '2px solid #cccccc';
                stepsHeaderElement.style.fontFamily = "Tahoma, 'Arial Unicode MS', Arial, sans-serif";
                const stepsHeader = locale === 'ar' ? 'التعليمات خطوة بخطوة' : 
                                   locale === 'fr' ? 'Instructions étape par étape' : 
                                   'Step-by-Step Instructions';
                stepsHeaderElement.textContent = stepsHeader;
                container.appendChild(stepsHeaderElement);

                for (const [index, step] of steps.entries()) {
                    // Step title
                    const stepTitleElement = document.createElement('h3');
                    stepTitleElement.style.fontSize = '16px';
                    stepTitleElement.style.fontWeight = 'bold';
                    stepTitleElement.style.marginTop = '18px';
                    stepTitleElement.style.marginBottom = '10px';
                    stepTitleElement.style.color = '#0066cc';
                    stepTitleElement.style.fontFamily = "Tahoma, 'Arial Unicode MS', Arial, sans-serif";
                    const stepTitle = step.title?.[locale] || step.title?.['en'] || `Step ${index + 1}`;
                    stepTitleElement.textContent = `${index + 1}. ${stepTitle}`;
                    container.appendChild(stepTitleElement);

                    // Step image
                    if (step.image_url) {
                        const imgElement = document.createElement('img');
                        imgElement.src = step.image_url;
                        imgElement.style.maxWidth = '100%';
                        imgElement.style.height = 'auto';
                        imgElement.style.margin = '12px 0';
                        imgElement.style.display = 'block';
                        imgElement.style.borderRadius = '4px';
                        imgElement.crossOrigin = 'anonymous';
                        container.appendChild(imgElement);
                    }

                    // Step content
                    if (step.content?.[locale] || step.content?.['en']) {
                        const content = step.content[locale] || step.content['en'];
                        const contentElement = document.createElement('div');
                        contentElement.style.fontSize = '13px';
                        contentElement.style.marginBottom = '12px';
                        contentElement.style.lineHeight = '1.7';
                        contentElement.style.fontFamily = "Tahoma, 'Arial Unicode MS', Arial, sans-serif";
                        contentElement.innerHTML = content;
                        // Ensure all text elements have proper fonts for Arabic
                        const allElements = contentElement.querySelectorAll('*');
                        allElements.forEach((el) => {
                            const htmlEl = el as HTMLElement;
                            htmlEl.style.fontFamily = "Tahoma, 'Arial Unicode MS', Arial, sans-serif";
                            htmlEl.style.color = '#000000';
                        });
                        container.appendChild(contentElement);
                    }
                }
            }

            document.body.appendChild(container);

            // Wait longer for fonts and images to fully load, especially for Arabic
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Ensure all images are loaded before rendering
            const images = container.querySelectorAll('img');
            const imagePromises = Array.from(images).map(img => {
                return new Promise((resolve) => {
                    if ((img as HTMLImageElement).complete) {
                        resolve(true);
                    } else {
                        img.addEventListener('load', () => resolve(true));
                        img.addEventListener('error', () => resolve(true));
                    }
                });
            });
            await Promise.all(imagePromises);

            // Convert container to canvas using html2canvas with optimized settings
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowHeight: container.scrollHeight,
                windowWidth: container.scrollWidth,
                ignoreElements: (element: Element) => {
                    return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
                },
            });

            // Remove temporary container
            document.body.removeChild(container);

            // Create PDF from canvas
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate proper scaling to maintain aspect ratio
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const numPages = Math.ceil(imgHeight / pageHeight);

            // Add image(s) to PDF, creating new pages as needed
            for (let i = 0; i < numPages; i++) {
                if (i > 0) {
                    pdf.addPage();
                }
                
                const pageImgHeight = Math.min(pageHeight, imgHeight - i * pageHeight);
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageImgHeight);
            }

            // Generate filename
            const filename = `${projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

            // Download
            pdf.save(filename);

        } catch (error) {
            console.error('Failed to generate PDF:', error);
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
                <Download className="mr-2 h-4 w-4 animate-pulse" />
            ) : (
                <FileText className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : label}
        </Button>
    );
}