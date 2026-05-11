'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema, resetPasswordSchema, formatZodError } from '@/lib/schemas'

export type AuthState = {
    error?: string
    message?: string
    success?: boolean
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const result = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })
    if (!result.success) return { error: formatZodError(result.error), success: false }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword(result.data)
    if (error) return { error: error.message, success: false }

    revalidatePath('/', 'layout')
    redirect('/app')
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const result = signupSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })
    if (!result.success) return { error: formatZodError(result.error), success: false }

    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
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
    const result = resetPasswordSchema.safeParse({
        email: formData.get('email'),
    })
    if (!result.success) return { error: formatZodError(result.error) }

    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
    })

    if (error) return { error: error.message }
    return { message: 'Check your email for a password reset link.' }
}
