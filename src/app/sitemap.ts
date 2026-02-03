import { getProjects } from '@/lib/api/projects';
import { MetadataRoute } from 'next';

const baseUrl = 'https://arduinolab.vercel.app'; // Replace with env var in prod

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const projects = await getProjects({});

    const projectUrls = projects.map((project) => ({
        url: `${baseUrl}/en/projects/${project.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
            languages: {
                en: `${baseUrl}/en/projects/${project.slug}`,
                fr: `${baseUrl}/fr/projects/${project.slug}`,
                ar: `${baseUrl}/ar/projects/${project.slug}`,
            },
        },
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
            alternates: {
                languages: {
                    en: `${baseUrl}/en`,
                    fr: `${baseUrl}/fr`,
                    ar: `${baseUrl}/ar`,
                },
            },
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
            alternates: {
                languages: {
                    en: `${baseUrl}/en/about`,
                    fr: `${baseUrl}/fr/about`,
                    ar: `${baseUrl}/ar/about`,
                },
            },
        },
        ...projectUrls,
    ];
}
