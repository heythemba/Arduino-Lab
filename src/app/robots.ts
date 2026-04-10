import { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * Robots.txt configuration for search engines.
 *
 * Disallows crawling of admin and auth routes while exposing the main site
 * and referencing the generated sitemap.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/auth'],
        },
        sitemap: `${env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
    };
}
