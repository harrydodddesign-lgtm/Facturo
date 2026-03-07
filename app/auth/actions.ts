'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export type AuthState = {
    error?: string
    message?: string
    success?: boolean
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message, success: false }
    }

    revalidatePath('/', 'layout')
    redirect('/app')
    // Redirect throws, so we don't reach here usually, but for TS:
    return { success: true }
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message, success: false }
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
        revalidatePath('/', 'layout')
        redirect('/app')
    }

    return { success: true, message: 'Check your email to confirm your account.' }
}

export async function loginAsGuest() {
    const cookieStore = await cookies()
    cookieStore.set('demo_mode', 'true', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 1 day
    })

    redirect('/app/invoices')
}
