/**
 * Server-side Supabase client utility.
 * 
 * This module provides a server-side Supabase instance for use in Server Components,
 * Server Actions, and Route Handlers. It properly manages cookies and sessions
 * in the Next.js server environment.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates and returns a server-side Supabase client.
 * 
 * This async function should be used in:
 * - Server Components
 * - Server Actions ("use server")
 * - Route Handlers (app/api/*)
 * - Any server-side code that needs database access
 * 
 * The client handles authentication by reading and writing cookies through Next.js's
 * cookie API. The try-catch block in setAll handles cases where cookies are read
 * from Server Components (which is safe to ignore due to middleware refreshing sessions).
 * 
 * @returns A Promise that resolves to a configured Supabase server client instance
 * 
 * @example
 * // In a Server Component
 * import { createClient } from '@/lib/supabase/server';
 * 
 * export default async function Page() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('projects').select('*');
 *   return <div>...</div>;
 * }
 * 
 * @example
    * // In a Server Action
 * 'use server';
 * import { createClient } from '@/lib/supabase/server';
 * 
 * export async function myAction() {
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   // ...
 * }
 */
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
