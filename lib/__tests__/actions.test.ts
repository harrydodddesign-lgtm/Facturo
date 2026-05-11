import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server')
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
    createClientAction,
    updateClientAction,
    deleteClientAction,
    updateSettingsAction,
    createInvoiceAction,
    updateInvoiceAction,
    updateInvoiceStatusAction,
    toggleAccountantSubmittedAction,
    deleteInvoiceAction,
} from '@/lib/actions'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const VALID_CLIENT = {
    name: 'Acme Corp',
    client_code: 'ACME',
    preferred_currency: 'EUR',
}

const VALID_SETTINGS = {
    invoice_prefix: 'INV',
    default_iva: 21,
    default_irpf: 15,
    accountant_mode: false,
}

const VALID_INVOICE = {
    client_id: '550e8400-e29b-41d4-a716-446655440000',
    invoice_number: 'ACME-2024-001',
    date: '2024-01-15',
    due_date: '2024-02-15',
    line_items: [{ description: 'Service', quantity: 1, unit_price: 100 }],
    primary_currency: 'EUR',
    show_secondary_currency: false,
    show_iva: true,
    show_payment_details: false,
    show_notes: false,
    status: 'draft' as const,
    totals: { subtotal: 100, iva: 21, irpf: 0, expenses: 0, total: 121 },
}

// ─── Supabase mock helpers ────────────────────────────────────────────────────

function makeAuthenticatedSupabase(queryResult: { error: unknown } = { error: null }) {
    const eq = vi.fn().mockResolvedValue(queryResult)
    const update = vi.fn().mockReturnValue({ eq })
    const insert = vi.fn().mockResolvedValue(queryResult)
    const del = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue(queryResult) })
    const select = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    })

    return {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
        },
        from: vi.fn().mockReturnValue({ insert, update, delete: del, select }),
    }
}

beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(redirect).mockImplementation(() => { throw Object.assign(new Error(), { digest: 'NEXT_REDIRECT;replace;/test' }) })
})

// ─── createClientAction ───────────────────────────────────────────────────────

describe('createClientAction', () => {
    it('throws a validation error for invalid data', async () => {
        await expect(createClientAction({ name: '' })).rejects.toThrow('Client name is required')
    })

    it('throws when the user is not authenticated', async () => {
        const supabase = makeAuthenticatedSupabase()
        supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } })
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await expect(createClientAction(VALID_CLIENT)).rejects.toThrow('Not authenticated')
    })

    it('calls Supabase insert with validated data and user_id', async () => {
        const supabase = makeAuthenticatedSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        try { await createClientAction(VALID_CLIENT) } catch { /* redirect throws */ }
        expect(supabase.from).toHaveBeenCalledWith('clients')
        expect(supabase.from('clients').insert).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Acme Corp', user_id: 'u1' })
        )
    })

    it('strips unknown fields before insert', async () => {
        const supabase = makeAuthenticatedSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        try { await createClientAction({ ...VALID_CLIENT, user_id: 'injected', id: 'injected' }) } catch { /* redirect */ }
        const insertCall = vi.mocked(supabase.from('clients').insert).mock.calls[0][0]
        expect(insertCall).not.toHaveProperty('id', 'injected')
    })

    it('redirects to /app/clients on success', async () => {
        const supabase = makeAuthenticatedSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        vi.mocked(redirect).mockImplementation(vi.fn())
        await createClientAction(VALID_CLIENT)
        expect(redirect).toHaveBeenCalledWith('/app/clients?success=1')
    })

    it('throws when Supabase insert fails', async () => {
        const supabase = makeAuthenticatedSupabase({ error: new Error('DB error') })
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await expect(createClientAction(VALID_CLIENT)).rejects.toThrow('DB error')
    })
})

// ─── updateClientAction ───────────────────────────────────────────────────────

describe('updateClientAction', () => {
    it('throws a validation error for invalid data', async () => {
        await expect(updateClientAction('id1', { name: '' })).rejects.toThrow('Client name is required')
    })

    it('calls Supabase update with validated data', async () => {
        const supabase = makeAuthenticatedSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        vi.mocked(redirect).mockImplementation(vi.fn())
        await updateClientAction('id1', VALID_CLIENT)
        expect(supabase.from).toHaveBeenCalledWith('clients')
    })
})

// ─── deleteClientAction ───────────────────────────────────────────────────────

describe('deleteClientAction', () => {
    it('calls Supabase delete and redirects', async () => {
        const supabase = makeAuthenticatedSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        vi.mocked(redirect).mockImplementation(vi.fn())
        await deleteClientAction('id1')
        expect(supabase.from).toHaveBeenCalledWith('clients')
        expect(redirect).toHaveBeenCalledWith('/app/clients?success=1')
    })
})

// ─── updateSettingsAction ─────────────────────────────────────────────────────

describe('updateSettingsAction', () => {
    it('throws a validation error for invalid data (IVA > 100)', async () => {
        await expect(updateSettingsAction({ default_iva: 150 })).rejects.toThrow('IVA cannot exceed 100%')
    })

    it('updates existing settings row', async () => {
        const existing = { id: 'settings-1' }
        const eq = vi.fn().mockResolvedValue({ error: null })
        const update = vi.fn().mockReturnValue({ eq })
        const selectChain = {
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: existing, error: null }),
            }),
        }
        const supabase = {
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
            from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(selectChain), update }),
        }
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await updateSettingsAction(VALID_SETTINGS)
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ invoice_prefix: 'INV' }))
    })

    it('inserts settings when none exist yet', async () => {
        const insert = vi.fn().mockResolvedValue({ error: null })
        const selectChain = {
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
        }
        const supabase = {
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
            from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(selectChain), insert }),
        }
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await updateSettingsAction(VALID_SETTINGS)
        expect(insert).toHaveBeenCalledWith(expect.objectContaining({ invoice_prefix: 'INV', user_id: 'u1' }))
    })
})

// ─── createInvoiceAction ──────────────────────────────────────────────────────

describe('createInvoiceAction', () => {
    it('throws a validation error for invalid data', async () => {
        await expect(createInvoiceAction({ invoice_number: '' })).rejects.toThrow()
    })

    it('throws when user is not authenticated', async () => {
        const supabase = makeAuthenticatedSupabase()
        supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } })
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await expect(createInvoiceAction(VALID_INVOICE)).rejects.toThrow('Not authenticated')
    })

    it('calls Supabase insert with user_id on success', async () => {
        const supabase = makeAuthenticatedSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        vi.mocked(redirect).mockImplementation(vi.fn())
        await createInvoiceAction(VALID_INVOICE)
        expect(supabase.from).toHaveBeenCalledWith('invoices')
        const insertCall = vi.mocked(supabase.from('invoices').insert).mock.calls[0][0]
        expect(insertCall).toMatchObject({ user_id: 'u1', invoice_number: 'ACME-2024-001' })
    })
})

// ─── updateInvoiceStatusAction ────────────────────────────────────────────────

describe('updateInvoiceStatusAction', () => {
    it('throws for an invalid status value', async () => {
        await expect(updateInvoiceStatusAction('id1', 'pending')).rejects.toThrow('Invalid status: pending')
    })

    it('updates status and sets sent_at when status is sent', async () => {
        const eq = vi.fn().mockResolvedValue({ error: null })
        const update = vi.fn().mockReturnValue({ eq })
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn().mockReturnValue({ update }),
        } as any)
        await updateInvoiceStatusAction('id1', 'sent')
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'sent', sent_at: expect.any(String) }))
    })

    it('updates status and sets paid_at when status is paid', async () => {
        const eq = vi.fn().mockResolvedValue({ error: null })
        const update = vi.fn().mockReturnValue({ eq })
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn().mockReturnValue({ update }),
        } as any)
        await updateInvoiceStatusAction('id1', 'paid')
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'paid', paid_at: expect.any(String) }))
    })
})

// ─── toggleAccountantSubmittedAction ─────────────────────────────────────────

describe('toggleAccountantSubmittedAction', () => {
    it('updates submitted_to_accountant with the given boolean value', async () => {
        const eq = vi.fn().mockResolvedValue({ error: null })
        const update = vi.fn().mockReturnValue({ eq })
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn().mockReturnValue({ update }),
        } as any)
        await toggleAccountantSubmittedAction('id1', true)
        expect(update).toHaveBeenCalledWith({ submitted_to_accountant: true })
    })
})

// ─── deleteInvoiceAction ──────────────────────────────────────────────────────

describe('deleteInvoiceAction', () => {
    it('calls Supabase delete and redirects', async () => {
        const supabase = makeAuthenticatedSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        vi.mocked(redirect).mockImplementation(vi.fn())
        await deleteInvoiceAction('id1')
        expect(supabase.from).toHaveBeenCalledWith('invoices')
        expect(redirect).toHaveBeenCalledWith('/app/invoices?success=1')
    })
})

// ─── updateInvoiceAction ──────────────────────────────────────────────────────

describe('updateInvoiceAction', () => {
    it('throws a validation error for invalid data', async () => {
        await expect(updateInvoiceAction('id1', { invoice_number: '' })).rejects.toThrow()
    })

    it('calls Supabase update with validated data', async () => {
        const supabase = makeAuthenticatedSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        vi.mocked(redirect).mockImplementation(vi.fn())
        await updateInvoiceAction('id1', VALID_INVOICE)
        expect(supabase.from).toHaveBeenCalledWith('invoices')
    })
})
