import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server')

import { createClient } from '@/lib/supabase/server'
import { getClients, getClient, getSettings, getInvoices, getInvoice, getInvoicesByClient } from '@/lib/data'

// Builds a chainable Supabase query mock. The chain is thenable so it can be
// directly awaited (for queries without .single()), and .single() resolves too.
function makeChain(result: { data: unknown; error: unknown }) {
    const chain: Record<string, unknown> = {}
    const methods = ['select', 'order', 'eq', 'like']
    for (const m of methods) chain[m] = vi.fn().mockReturnValue(chain)
    chain.single = vi.fn().mockResolvedValue(result)
    chain.then = (onFulfilled: (v: unknown) => unknown, onRejected: (e: unknown) => unknown) =>
        Promise.resolve(result).then(onFulfilled, onRejected)
    return chain
}

function mockSupabase(result: { data: unknown; error: unknown }) {
    const chain = makeChain(result)
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)
    return chain
}

beforeEach(() => vi.resetAllMocks())

// ─── getClients ──────────────────────────────────────────────────────────────

describe('getClients', () => {
    it('returns clients array on success', async () => {
        const clients = [{ id: '1', name: 'Acme' }]
        mockSupabase({ data: clients, error: null })
        expect(await getClients()).toEqual(clients)
    })

    it('throws when Supabase returns an error', async () => {
        mockSupabase({ data: null, error: new Error('DB error') })
        await expect(getClients()).rejects.toThrow('DB error')
    })
})

// ─── getClient ───────────────────────────────────────────────────────────────

describe('getClient', () => {
    it('returns a single client by id', async () => {
        const client = { id: '1', name: 'Acme' }
        mockSupabase({ data: client, error: null })
        expect(await getClient('1')).toEqual(client)
    })

    it('throws when Supabase returns an error', async () => {
        mockSupabase({ data: null, error: new Error('Not found') })
        await expect(getClient('bad-id')).rejects.toThrow('Not found')
    })
})

// ─── getSettings ─────────────────────────────────────────────────────────────

describe('getSettings', () => {
    it('returns settings on success', async () => {
        const settings = { id: '1', invoice_prefix: 'INV' }
        mockSupabase({ data: settings, error: null })
        expect(await getSettings()).toEqual(settings)
    })

    it('returns null when no settings row exists (PGRST116)', async () => {
        mockSupabase({ data: null, error: { code: 'PGRST116', message: 'no rows' } })
        expect(await getSettings()).toBeNull()
    })

    it('throws on non-PGRST116 errors', async () => {
        const err = { code: 'OTHER', message: 'DB error' }
        mockSupabase({ data: null, error: err })
        await expect(getSettings()).rejects.toEqual(err)
    })
})

// ─── getInvoices ─────────────────────────────────────────────────────────────

describe('getInvoices', () => {
    it('returns invoices array on success', async () => {
        const invoices = [{ id: '1', invoice_number: 'INV-001' }]
        mockSupabase({ data: invoices, error: null })
        expect(await getInvoices()).toEqual(invoices)
    })

    it('throws when Supabase returns an error', async () => {
        mockSupabase({ data: null, error: new Error('DB error') })
        await expect(getInvoices()).rejects.toThrow('DB error')
    })
})

// ─── getInvoice ──────────────────────────────────────────────────────────────

describe('getInvoice', () => {
    it('returns a single invoice by id', async () => {
        const invoice = { id: '1', invoice_number: 'INV-001' }
        mockSupabase({ data: invoice, error: null })
        expect(await getInvoice('1')).toEqual(invoice)
    })

    it('throws when Supabase returns an error', async () => {
        mockSupabase({ data: null, error: new Error('Not found') })
        await expect(getInvoice('bad-id')).rejects.toThrow('Not found')
    })
})

// ─── getInvoicesByClient ─────────────────────────────────────────────────────

describe('getInvoicesByClient', () => {
    it('returns invoices for the given client id', async () => {
        const invoices = [{ id: '1', client_id: 'c1' }]
        mockSupabase({ data: invoices, error: null })
        expect(await getInvoicesByClient('c1')).toEqual(invoices)
    })

    it('throws when Supabase returns an error', async () => {
        mockSupabase({ data: null, error: new Error('DB error') })
        await expect(getInvoicesByClient('c1')).rejects.toThrow('DB error')
    })
})
