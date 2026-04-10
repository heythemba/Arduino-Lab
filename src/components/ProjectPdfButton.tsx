'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
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
 * - Supports bold, italic, lists, code blocks, and line breaks
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
            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const maxImageWidth = pageWidth - 2 * margin;
            const maxImageHeight = 100; // Max height for images
            let yPosition = margin;

            // Helper function to parse HTML content and add formatted text to PDF
            const addFormattedText = (htmlContent: string) => {
                // Create a temporary DOM element to parse HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;

                const processNode = (node: Node, currentFontSize: number = 10, isBold: boolean = false, isItalic: boolean = false, listLevel: number = 0) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent?.trim();
                        if (text) {
                            // Handle list indentation
                            const indent = '  '.repeat(listLevel);
                            const fullText = indent + text;

                            pdf.setFontSize(currentFontSize);
                            const fontStyle = isBold && isItalic ? 'bolditalic' :
                                            isBold ? 'bold' :
                                            isItalic ? 'italic' : 'normal';
                            pdf.setFont('helvetica', fontStyle);

                            const lines = pdf.splitTextToSize(fullText, pageWidth - 2 * margin);
                            const lineHeight = currentFontSize * 0.5;

                            for (const line of lines) {
                                if (yPosition + lineHeight > pageHeight - margin) {
                                    pdf.addPage();
                                    yPosition = margin;
                                }
                                pdf.text(line, margin, yPosition);
                                yPosition += lineHeight;
                            }
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        const tagName = element.tagName.toLowerCase();

                        switch (tagName) {
                            case 'p':
                                // Process children, then add paragraph spacing
                                for (const child of Array.from(element.childNodes)) {
                                    processNode(child, currentFontSize, isBold, isItalic, listLevel);
                                }
                                yPosition += 5; // Paragraph spacing
                                break;

                            case 'br':
                                yPosition += currentFontSize * 0.5; // Line break
                                break;

                            case 'strong':
                            case 'b':
                                for (const child of Array.from(element.childNodes)) {
                                    processNode(child, currentFontSize, true, isItalic, listLevel);
                                }
                                break;

                            case 'em':
                            case 'i':
                                for (const child of Array.from(element.childNodes)) {
                                    processNode(child, currentFontSize, isBold, true, listLevel);
                                }
                                break;

                            case 'ul':
                                yPosition += 3; // Small space before list
                                for (const child of Array.from(element.children)) {
                                    if (child.tagName.toLowerCase() === 'li') {
                                        // Add bullet point
                                        const bulletText = '• ';
                                        pdf.setFontSize(currentFontSize);
                                        pdf.setFont('helvetica', isBold && isItalic ? 'bolditalic' : isBold ? 'bold' : isItalic ? 'italic' : 'normal');

                                        if (yPosition + currentFontSize * 0.5 > pageHeight - margin) {
                                            pdf.addPage();
                                            yPosition = margin;
                                        }
                                        pdf.text(bulletText, margin + (listLevel * 20), yPosition);

                                        // Process list item content
                                        for (const liChild of Array.from(child.childNodes)) {
                                            processNode(liChild, currentFontSize, isBold, isItalic, listLevel + 1);
                                        }
                                        yPosition += 3; // Space between list items
                                    }
                                }
                                yPosition += 3; // Space after list
                                break;

                            case 'ol':
                                let counter = 1;
                                yPosition += 3; // Small space before list
                                for (const child of Array.from(element.children)) {
                                    if (child.tagName.toLowerCase() === 'li') {
                                        // Add numbered item
                                        const numberText = `${counter}. `;
                                        pdf.setFontSize(currentFontSize);
                                        pdf.setFont('helvetica', isBold && isItalic ? 'bolditalic' : isBold ? 'bold' : isItalic ? 'italic' : 'normal');

                                        if (yPosition + currentFontSize * 0.5 > pageHeight - margin) {
                                            pdf.addPage();
                                            yPosition = margin;
                                        }
                                        pdf.text(numberText, margin + (listLevel * 20), yPosition);

                                        // Process list item content
                                        for (const liChild of Array.from(child.childNodes)) {
                                            processNode(liChild, currentFontSize, isBold, isItalic, listLevel + 1);
                                        }
                                        yPosition += 3; // Space between list items
                                        counter++;
                                    }
                                }
                                yPosition += 3; // Space after list
                                break;

                            case 'li':
                                // This is handled by ul/ol processing above
                                for (const child of Array.from(element.childNodes)) {
                                    processNode(child, currentFontSize, isBold, isItalic, listLevel);
                                }
                                break;

                            case 'code':
                                // Inline code - use monospace font
                                pdf.setFont('courier', isBold ? 'bold' : 'normal');
                                for (const child of Array.from(element.childNodes)) {
                                    processNode(child, currentFontSize, false, false, listLevel);
                                }
                                pdf.setFont('helvetica', isBold && isItalic ? 'bolditalic' : isBold ? 'bold' : isItalic ? 'italic' : 'normal');
                                break;

                            case 'pre':
                                // Code block - use monospace font with background
                                const codeText = element.textContent || '';
                                pdf.setFont('courier', 'normal');
                                pdf.setFontSize(9);

                                const codeLines = codeText.split('\n');
                                for (const codeLine of codeLines) {
                                    if (yPosition + 9 * 0.5 > pageHeight - margin) {
                                        pdf.addPage();
                                        yPosition = margin;
                                    }
                                    pdf.text(codeLine, margin + 10, yPosition);
                                    yPosition += 9 * 0.5;
                                }
                                pdf.setFont('helvetica', 'normal');
                                pdf.setFontSize(currentFontSize);
                                yPosition += 5; // Space after code block
                                break;

                            case 'a':
                                // Links - underline text
                                for (const child of Array.from(element.childNodes)) {
                                    processNode(child, currentFontSize, isBold, isItalic, listLevel);
                                }
                                // Note: jsPDF doesn't support clickable links easily, so we just format the text
                                break;

                            default:
                                // For other elements, just process their children
                                for (const child of Array.from(element.childNodes)) {
                                    processNode(child, currentFontSize, isBold, isItalic, listLevel);
                                }
                                break;
                        }
                    }
                };

                // Process all child nodes of the HTML content
                for (const child of Array.from(tempDiv.childNodes)) {
                    processNode(child);
                }
            };

            // Helper function to add text with word wrapping
            const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
                pdf.setFontSize(fontSize);
                if (isBold) {
                    pdf.setFont('helvetica', 'bold');
                } else {
                    pdf.setFont('helvetica', 'normal');
                }

                const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
                const lineHeight = fontSize * 0.5;

                for (const line of lines) {
                    if (yPosition + lineHeight > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    pdf.text(line, margin, yPosition);
                    yPosition += lineHeight;
                }

                yPosition += 5; // Small gap after text block
            };

            // Helper function to load and add image to PDF
            const addImageToPDF = async (imageUrl: string): Promise<void> => {
                return new Promise((resolve) => {
                    const img = new window.Image();
                    img.crossOrigin = 'anonymous'; // Handle CORS

                    img.onload = () => {
                        // Calculate dimensions to fit within max constraints
                        const aspectRatio = img.width / img.height;
                        let imgWidth = maxImageWidth;
                        let imgHeight = imgWidth / aspectRatio;

                        // If height exceeds max, scale down
                        if (imgHeight > maxImageHeight) {
                            imgHeight = maxImageHeight;
                            imgWidth = imgHeight * aspectRatio;
                        }

                        // Check if image fits on current page
                        if (yPosition + imgHeight > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }

                        // Create canvas to convert image to base64
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx?.drawImage(img, 0, 0);

                        try {
                            const imgData = canvas.toDataURL('image/jpeg', 0.8);
                            pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
                            yPosition += imgHeight + 10; // Gap after image
                        } catch (error) {
                            console.warn('Failed to add image to PDF:', error);
                            // Continue without the image
                        }

                        resolve();
                    };

                    img.onerror = () => {
                        console.warn('Failed to load image:', imageUrl);
                        resolve(); // Continue without the image
                    };

                    img.src = imageUrl;
                });
            };

            // Title
            addText(projectTitle, 20, true);
            yPosition += 10;

            // Description
            if (projectDescription) {
                addText(projectDescription, 12);
                yPosition += 10;
            }

            // Steps
            if (steps && steps.length > 0) {
                addText('Step-by-Step Instructions:', 14, true);
                yPosition += 5;

                for (const [index, step] of steps.entries()) {
                    // Step title
                    const stepTitle = step.title?.[locale] || step.title?.['en'] || `Step ${index + 1}`;
                    addText(`${index + 1}. ${stepTitle}`, 12, true);

                    // Step image (if available)
                    if (step.image_url) {
                        try {
                            await addImageToPDF(step.image_url);
                        } catch (error) {
                            console.warn('Failed to add step image:', error);
                        }
                    }

                    // Step content (with HTML formatting preserved)
                    if (step.content?.[locale] || step.content?.['en']) {
                        const content = step.content[locale] || step.content['en'];
                        addFormattedText(content);
                    }

                    yPosition += 10; // Gap between steps
                }
            }

            // Generate filename from project title (remove special characters)
            const filename = `${projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

            // Download the PDF
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