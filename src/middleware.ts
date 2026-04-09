import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js Middleware.
 * 
 * This function runs on every request (that matches the config.matcher).
 * It delegates to `updateSession` which handles:
 * 1. Supabase Auth session refresh (to keep users logged in).
 * 2. Next-Intl locale handling (redirecting / to /en, etc.).
 * 3. Protected route guards (redirecting unauthenticated users to login).
 * 
 * @param request - The incoming request.
 */
export async function middleware(request: NextRequest) {
    const response = await updateSession(request);

    // Apply Content Security Policy (CSP)
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://cdlpxyyjknpspihrlnnq.supabase.co https://lab.pnlmahdia.com;
        font-src 'self' data:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        connect-src 'self' https://cdlpxyyjknpspihrlnnq.supabase.co https://api.supabase.io https://vitals.vercel-insights.com;
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);
    
    // Additional Security & CORS Headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Access-Control-Allow-Origin', 'https://lab.pnlmahdia.com');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - auth (Supabase auth callbacks)
         * - images/files extensions
         */
        '/((?!api|_next/static|_next/image|favicon.ico|auth|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
