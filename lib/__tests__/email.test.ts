import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures these are available inside the vi.mock factory (which is hoisted).
const { mockEmailSend } = vi.hoisted(() => ({
    mockEmailSend: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('resend', () => ({
    Resend: class {
        emails = { send: mockEmailSend }
    },
}))
vi.mock('@react-pdf/renderer', () => ({
    renderToBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-pdf')),
}))
vi.mock('@/components/pdf/invoice-pdf', () => ({
    InvoicePDF: () => null,
}))
vi.mock('@/lib/supabase/server')
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { sendInvoiceEmail } from '@/lib/email'
import { Invoice, Client, Settings } from '@/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const invoice: Invoice = {
    id: 'inv-1',
    user_id: 'u1',
    client_id: 'c1',
    invoice_number: 'ACME-2024-001',
    date: '2024-01-15',
    due_date: '2024-02-15',
    line_items: [],
    primary_currency: 'EUR',
    secondary_currency: null,
    exchange_rate_used: null,
    show_secondary_currency: false,
    show_iva: true,
    show_payment_details: false,
    payment_details: null,
    show_notes: false,
    notes: null,
    status: 'draft',
    submitted_to_accountant: false,
    totals: { subtotal: 100, iva: 21, irpf: 0, expenses: 0, total: 121 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
}

const client: Client = {
    id: 'c1',
    user_id: 'u1',
    name: 'Acme Corp',
    client_code: 'ACME',
    contact: null,
    address: null,
    preferred_currency: 'EUR',
    notes: null,
    nif: null,
    email: 'client@acme.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
}

const settings: Settings = {
    id: 's1',
    user_id: 'u1',
    invoice_prefix: 'ACME',
    default_iva: 21,
    default_irpf: 15,
    accountant_mode: false,
    company_name: 'My Company',
    company_address: null,
    tax_id: null,
    company_email: 'hello@mycompany.com',
    company_phone: null,
    bank_name: null,
    iban: null,
    swift_bic: null,
    payment_terms: 30,
    invoice_footer: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
}

function makeSupabase() {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    return { from: vi.fn().mockReturnValue({ update }) }
}

beforeEach(() => {
    vi.resetAllMocks()
    mockEmailSend.mockResolvedValue({ error: null })
})

// ─── sendInvoiceEmail ─────────────────────────────────────────────────────────

describe('sendInvoiceEmail', () => {
    it('sends the email to the specified recipient', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabase() as any)
        await sendInvoiceEmail({ invoice, client, settings, to: 'recipient@test.com', subject: 'Invoice' })
        expect(mockEmailSend).toHaveBeenCalledWith(expect.objectContaining({ to: 'recipient@test.com' }))
    })

    it('uses company_name and company_email for the from field', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabase() as any)
        await sendInvoiceEmail({ invoice, client, settings, to: 'r@t.com', subject: 'Inv' })
        expect(mockEmailSend).toHaveBeenCalledWith(
            expect.objectContaining({ from: 'My Company <hello@mycompany.com>' })
        )
    })

    it('falls back to default from address when settings has no company email', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabase() as any)
        await sendInvoiceEmail({
            invoice, client,
            settings: { ...settings, company_email: null },
            to: 'r@t.com',
            subject: 'Inv',
        })
        expect(mockEmailSend).toHaveBeenCalledWith(
            expect.objectContaining({ from: expect.stringContaining('noreply@facturo.app') })
        )
    })

    it('attaches the PDF with the invoice number as filename', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabase() as any)
        await sendInvoiceEmail({ invoice, client, settings, to: 'r@t.com', subject: 'Inv' })
        expect(mockEmailSend).toHaveBeenCalledWith(
            expect.objectContaining({
                attachments: expect.arrayContaining([
                    expect.objectContaining({ filename: 'ACME-2024-001.pdf' }),
                ]),
            })
        )
    })

    it('includes a custom message in the email body when provided', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabase() as any)
        await sendInvoiceEmail({
            invoice, client, settings, to: 'r@t.com', subject: 'Inv',
            message: 'Please pay promptly.',
        })
        expect(mockEmailSend).toHaveBeenCalledWith(
            expect.objectContaining({ text: expect.stringContaining('Please pay promptly.') })
        )
    })

    it('marks the invoice as sent after a successful send', async () => {
        const supabase = makeSupabase()
        vi.mocked(createClient).mockResolvedValue(supabase as any)
        await sendInvoiceEmail({ invoice, client, settings, to: 'r@t.com', subject: 'Inv' })
        expect(supabase.from).toHaveBeenCalledWith('invoices')
        const updateCall = vi.mocked(supabase.from('invoices').update).mock.calls[0][0]
        expect(updateCall).toMatchObject({ status: 'sent' })
        expect(updateCall.sent_at).toBeDefined()
    })

    it('throws when Resend returns an error', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabase() as any)
        mockEmailSend.mockResolvedValue({ error: { message: 'API key invalid' } })
        await expect(
            sendInvoiceEmail({ invoice, client, settings, to: 'r@t.com', subject: 'Inv' })
        ).rejects.toThrow('API key invalid')
    })

    it('sends with null settings without throwing', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabase() as any)
        await expect(
            sendInvoiceEmail({ invoice, client, settings: null, to: 'r@t.com', subject: 'Inv' })
        ).resolves.not.toThrow()
    })
})
