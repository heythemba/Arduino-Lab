'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * server action to handle user login.
 * 
 * @param prevState - The previous state of the form (for error usage).
 * @param formData - Form data containing 'email' and 'password'.
 */
export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Trim whitespace to prevent "Invalid login values" errors
    const email = (formData.get('email') as string).trim()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { message: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

/**
 * Server action to handle user logout.
 * 
 * Signs out the user from Supabase and redirects them to the home page.
 */
export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}
