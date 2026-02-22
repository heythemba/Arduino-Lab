import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from '../../i18n/routing';

/**
 * Updates the Supabase session and handles i18n routing.
 * 
 * This function is the core of our Middleware. It:
 * 1. Initializes next-intl middleware to handle locale redirects (e.g. / -> /en).
 * 2. Creates a Supabase Server Client to manage authentication.
 * 3. Refreshes the Auth Token if it's expired (crucial for keeping users logged in).
 * 4. Ensures cookies are correctly set on both the Request and Response.
 * 
 * @param request - The incoming Next.js request.
 * @returns The modified response with updated cookies and locale headers.
 */
export async function updateSession(request: NextRequest) {
    // 1. Create the response using next-intl middleware first to handle redirects/locale
    // This ensures i18n is handled correctly on the response we modify
    const handleI18n = createMiddleware(routing);
    let response = handleI18n(request);

    // If next-intl returned a redirect (e.g. root to /en), just return it
    if (response.headers.has('location')) {
        return response;
    }

    // 2. Setup Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    // Update response cookies to persist the session
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 3. Refreshing the auth token
    // This call is required to signal Supabase that the session is active.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 4. Protected Routes Logic
    // Example: Redirect unauthenticated users from /admin
    // (Currently handled in Page components/Server Actions for finer control)
    // if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    //   return NextResponse.redirect(new URL('/login', request.url))
    // }

    // Fix for OpenNext/Cloudflare 404s with next-intl
    // OpenNext relies on x-middleware-next to determine if it should continue to the page.
    // If we're setting cookies but NOT redirecting or rewriting, we need to strip this header
    // so Cloudflare doesn't try to look for a non-existent asset path.
    if (!response.headers.has('location') && !response.headers.has('x-middleware-rewrite')) {
        response.headers.delete("x-middleware-next");
    }

    return response
}
