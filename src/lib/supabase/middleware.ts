import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from '../../i18n/routing';

export async function updateSession(request: NextRequest) {
    // 1. Create the response using next-intl middleware first to handle redirects/locale
    // This ensures i18n is handled correctly on the response we modify
    const handleI18n = createMiddleware(routing);
    let response = handleI18n(request);

    // If next-intl returned a redirect (e.g. root to /en), just return it
    if (response.headers.has('location')) {
        return response;
    }

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

                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refreshing the auth token
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected Routes Logic
    // For now, we only care about refreshing the session.
    // We will handle protection in the Layout or Page level/middleware checks for specific paths if needed.
    // But strictly speaking, we generally want to protect /admin or dashboard routes here.

    // Example protection (can expand later):
    // if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    //   return NextResponse.redirect(new URL('/login', request.url))
    // }

    return response
}
