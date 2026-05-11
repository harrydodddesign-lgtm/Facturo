import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server')
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { login, signup, resetPassword } from '@/app/auth/actions'

function makeFormData(fields: Record<string, string>): FormData {
    const fd = new FormData()
    for (const [k, v] of Object.entries(fields)) fd.append(k, v)
    return fd
}

function makeSupabase(overrides: Record<string, unknown> = {}) {
    return {
        auth: {
            signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
            signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
            resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            ...overrides,
        },
    }
}

beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(redirect).mockImplementation(vi.fn())
})

// ─── login ────────────────────────────────────────────────────────────────────

describe('login', () => {
    it('returns error state for an invalid email', async () => {
        const result = await login({}, makeFormData({ email: 'not-an-email', password: 'secret' }))
        expect(result.error).toMatch(/valid email/)
        expect(result.success).toBe(false)
    })

    it('returns error state when password is empty', async () => {
        const result = await login({}, makeFormData({ email: 'a@b.com', password: '' }))
        expect(result.error).toMatch(/required/)
        expect(result.success).toBe(false)
    })

    it('returns error state when Supabase auth fails', async () => {
        const supabase = makeSupabase({
            signInWithPassword: vi.fn().mockResolvedValue({ error: { message: 'Invalid credentials' } }),
        })
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        const result = await login({}, makeFormData({ email: 'a@b.com', password: 'wrongpassword' }))
        expect(result.error).toBe('Invalid credentials')
        expect(result.success).toBe(false)
    })

    it('calls redirect to /app on successful login', async () => {
        const supabase = makeSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await login({}, makeFormData({ email: 'a@b.com', password: 'correctpassword' }))
        expect(redirect).toHaveBeenCalledWith('/app')
    })

    it('calls signInWithPassword with validated credentials', async () => {
        const supabase = makeSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await login({}, makeFormData({ email: 'a@b.com', password: 'secret' }))
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'a@b.com',
            password: 'secret',
        })
    })
})

// ─── signup ───────────────────────────────────────────────────────────────────

describe('signup', () => {
    it('returns error state for an invalid email', async () => {
        const result = await signup({}, makeFormData({ email: 'bad', password: 'password123' }))
        expect(result.error).toMatch(/valid email/)
        expect(result.success).toBe(false)
    })

    it('returns error state when password is too short', async () => {
        const result = await signup({}, makeFormData({ email: 'a@b.com', password: 'short' }))
        expect(result.error).toMatch(/8 characters/)
        expect(result.success).toBe(false)
    })

    it('returns error state when Supabase signup fails', async () => {
        const supabase = makeSupabase({
            signUp: vi.fn().mockResolvedValue({ error: { message: 'Email already registered' } }),
        })
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        const result = await signup({}, makeFormData({ email: 'a@b.com', password: 'password123' }))
        expect(result.error).toBe('Email already registered')
    })

    it('redirects to /app when a session exists after signup', async () => {
        const supabase = makeSupabase({
            getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'tok' } } }),
        })
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await signup({}, makeFormData({ email: 'a@b.com', password: 'password123' }))
        expect(redirect).toHaveBeenCalledWith('/app')
    })

    it('returns success message when email confirmation is required', async () => {
        const supabase = makeSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        const result = await signup({}, makeFormData({ email: 'a@b.com', password: 'password123' }))
        expect(result.success).toBe(true)
        expect(result.message).toMatch(/email/i)
    })
})

// ─── resetPassword ────────────────────────────────────────────────────────────

describe('resetPassword', () => {
    it('returns error state for an invalid email', async () => {
        const result = await resetPassword({}, makeFormData({ email: 'not-valid' }))
        expect(result.error).toMatch(/valid email/)
    })

    it('returns error state when Supabase fails', async () => {
        const supabase = makeSupabase({
            resetPasswordForEmail: vi.fn().mockResolvedValue({ error: { message: 'Rate limited' } }),
        })
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        const result = await resetPassword({}, makeFormData({ email: 'a@b.com' }))
        expect(result.error).toBe('Rate limited')
    })

    it('returns a success message on valid email', async () => {
        const supabase = makeSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        const result = await resetPassword({}, makeFormData({ email: 'a@b.com' }))
        expect(result.message).toMatch(/email/i)
        expect(result.error).toBeUndefined()
    })

    it('calls resetPasswordForEmail with the correct email', async () => {
        const supabase = makeSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await resetPassword({}, makeFormData({ email: 'user@example.com' }))
        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
            'user@example.com',
            expect.objectContaining({ redirectTo: expect.stringContaining('reset-password') })
        )
    })
})
