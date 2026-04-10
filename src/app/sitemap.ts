import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

import { env } from '@/lib/env';

/**
 * Sitemap generator for localized and dynamic project pages.
 *
 * Fetches project slugs from the database and builds locale-aware URLs
 * for the public website sitemap.
 */

const BASE_URL = env.NEXT_PUBLIC_BASE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();

    // Fetch all published project slugs
    const { data: projects } = await supabase
        .from('projects')
        .select('slug, updated_at')
        .order('updated_at', { ascending: false });

    const locales = ['en', 'fr', 'ar'];

    // Static pages for each locale
    const staticPages = locales.flatMap(locale => [
        {
            url: `${BASE_URL}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/${locale}/projects`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
    ]);

    // Dynamic project pages for each locale
    const projectPages = (projects ?? []).flatMap(project =>
        locales.map(locale => ({
            url: `${BASE_URL}/${locale}/projects/${project.slug}`,
            lastModified: new Date(project.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    );

    return [...staticPages, ...projectPages];
}
