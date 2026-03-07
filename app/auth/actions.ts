'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = {
    error?: string
    message?: string
    success?: boolean
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return { error: error.message, success: false }

    revalidatePath('/', 'layout')
    redirect('/app')
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

    if (error) return { error: error.message, success: false }

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
        revalidatePath('/', 'layout')
        redirect('/app')
    }

    return { success: true, message: 'Check your email to confirm your account.' }
}

export async function resetPassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
    })

    if (error) return { error: error.message }
    return { message: 'Check your email for a password reset link.' }
}
