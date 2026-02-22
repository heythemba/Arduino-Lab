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
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/',
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - auth (Supabase auth callbacks)
         * - images/files extensions
         */
        '/((?!_next/static|_next/image|favicon.ico|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
