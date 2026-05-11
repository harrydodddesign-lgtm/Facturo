import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Client } from '@/types'

vi.mock('@/lib/supabase/server')
vi.mock('@/lib/data')

import { createClient } from '@/lib/supabase/server'
import { getClient } from '@/lib/data'
import { generateInvoiceNumber } from '@/lib/invoice-numbering'

function makeClient(overrides: Partial<Client> = {}): Client {
    return {
        id: 'c1',
        user_id: 'u1',
        name: 'Acme Corp',
        client_code: 'ACME',
        contact: null,
        address: null,
        preferred_currency: 'EUR',
        notes: null,
        nif: null,
        email: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ...overrides,
    }
}

function makeSupabaseChain(result: { data: { invoice_number: string }[] | null; error: unknown }) {
    const limit = vi.fn().mockResolvedValue(result)
    const order = vi.fn().mockReturnValue({ limit })
    const like = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ like })
    const from = vi.fn().mockReturnValue({ select })
    return { from }
}

describe('generateInvoiceNumber', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('generates the first invoice number as PREFIX-YEAR-001', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabaseChain({ data: [], error: null }) as any)
        vi.mocked(getClient).mockResolvedValue(makeClient())

        expect(await generateInvoiceNumber('c1', '2024-03-15')).toBe('ACME-2024-001')
    })

    it('increments the sequence from the most recent matching invoice', async () => {
        vi.mocked(createClient).mockResolvedValue(
            makeSupabaseChain({ data: [{ invoice_number: 'ACME-2024-005' }], error: null }) as any
        )
        vi.mocked(getClient).mockResolvedValue(makeClient())

        expect(await generateInvoiceNumber('c1', '2024-03-15')).toBe('ACME-2024-006')
    })

    it('pads the sequence number to 3 digits', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabaseChain({ data: [], error: null }) as any)
        vi.mocked(getClient).mockResolvedValue(makeClient())

        const result = await generateInvoiceNumber('c1', '2024-01-01')
        expect(result).toMatch(/^ACME-2024-\d{3}$/)
    })

    it('uses the year from the provided date string', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabaseChain({ data: [], error: null }) as any)
        vi.mocked(getClient).mockResolvedValue(makeClient({ client_code: 'XYZ' }))

        expect(await generateInvoiceNumber('c1', '2025-06-01')).toBe('XYZ-2025-001')
    })

    it('uppercases the client_code prefix', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabaseChain({ data: [], error: null }) as any)
        vi.mocked(getClient).mockResolvedValue(makeClient({ client_code: 'abc' }))

        expect(await generateInvoiceNumber('c1', '2024-01-01')).toBe('ABC-2024-001')
    })

    it('falls back to first 3 chars of client name when client_code is empty', async () => {
        vi.mocked(createClient).mockResolvedValue(makeSupabaseChain({ data: [], error: null }) as any)
        vi.mocked(getClient).mockResolvedValue(makeClient({ client_code: '', name: 'Widgets Inc' }))

        expect(await generateInvoiceNumber('c1', '2024-03-15')).toBe('WID-2024-001')
    })

    it('throws when the client is not found', async () => {
        vi.mocked(getClient).mockResolvedValue(null)

        await expect(generateInvoiceNumber('bad-id', '2024-03-15')).rejects.toThrow('Client not found')
    })

    it('throws when Supabase returns an error', async () => {
        vi.mocked(createClient).mockResolvedValue(
            makeSupabaseChain({ data: null, error: new Error('DB error') }) as any
        )
        vi.mocked(getClient).mockResolvedValue(makeClient())

        await expect(generateInvoiceNumber('c1', '2024-03-15')).rejects.toThrow()
    })
})
