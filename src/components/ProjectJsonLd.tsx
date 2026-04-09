'use client';

import { FullProject } from '@/lib/api/projects';
import DOMPurify from 'isomorphic-dompurify';

import { env } from '@/lib/env';

const BASE_URL = env.NEXT_PUBLIC_BASE_URL;

/**
 * Renders a <script type="application/ld+json"> block using the HowTo schema.
 * This helps Google understand the step-by-step structure of a project guide
 * and may render rich results in search pages.
 *
 * @see https://schema.org/HowTo
 */
export default function ProjectJsonLd({
    project,
    locale,
}: {
    project: FullProject;
    locale: string;
}) {
    const title = project.title[locale] || project.title['en'];
    const description = project.description[locale] || project.description['en'];
    const url = `${BASE_URL}/${locale}/projects/${project.slug}`;

    const steps = (project.steps ?? []).map((step, index) => ({
        '@type': 'HowToStep',
        name: step.title?.[locale] || step.title?.['en'] || `Step ${index + 1}`,
        text: (step.content?.[locale] || step.content?.['en'] || '')
            .replace(/<[^>]+>/g, ''), // Strip HTML tags
        position: index + 1,
        ...(step.image_url && { image: step.image_url }),
    }));

    const inoFiles = (project.attachments ?? []).filter(a => a.file_type === 'ino');
    const stlFiles = (project.attachments ?? []).filter(a => a.file_type === 'stl');
    const zipFiles = (project.attachments ?? []).filter(a => a.file_type === 'zip');

    const supply = [
        ...stlFiles.map(f => ({
            '@type': 'HowToSupply',
            name: f.file_name,
            url: f.file_url,
        })),
        ...zipFiles.map(f => ({
            '@type': 'HowToSupply',
            name: f.file_name,
            url: f.file_url,
        })),
    ];

    const tool = inoFiles.map(f => ({
        '@type': 'HowToTool',
        name: f.file_name,
        url: f.file_url,
    }));

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: title,
        description,
        url,
        inLanguage: locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en',
        ...(project.hero_image_url && { image: project.hero_image_url }),
        author: {
            '@type': 'Organization',
            name: 'PNL Mahdia – SWAFY Project',
            url: BASE_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: 'ArduinoLab by PNL Mahdia',
            url: BASE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/icon.png`,
            },
        },
        keywords: [
            'ArduinoLab',
            'PNL Mahdia',
            'SWAFY Science with and for Youth',
            'Arduino Robotics Tunisia',
            'School Robotics Club',
            project.category,
            project.school_name,
        ]
            .filter(Boolean)
            .join(', '),
        step: steps,
        ...(supply.length > 0 && { supply }),
        ...(tool.length > 0 && { tool }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(JSON.stringify(jsonLd, null, 0)) }}
        />
    );
}
