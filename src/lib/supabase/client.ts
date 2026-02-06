/**
 * Browser-side Supabase client utility.
 * 
 * This module provides a client-side Supabase instance for use in React components
 * and client-side code. It uses the public anonymous key and is safe to use in the browser.
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates and returns a browser-side Supabase client.
 * 
 * This client should be used in:
 * - Client Components ("use client")
 * - Event handlers
 * - Client-side data fetching
 * 
 * The client automatically handles session management through cookies.
 * 
 * @returns A configured Supabase browser client instance
 * 
 * @example
 * // In a Client Component
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 * 
 * export default function MyComponent() {
 *   const supabase = createClient();
 *   // Use supabase for queries, auth, etc.
 * }
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
