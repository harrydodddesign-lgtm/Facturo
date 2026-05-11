import { describe, it, expect } from 'vitest'
import {
    calculateMonthlyRevenue,
    getInvoicesByStatus,
    getOverdueInvoices,
    calculateTotalEarnings,
    getStatusColor,
} from '@/lib/dashboard-helpers'
import { Invoice, InvoiceTotals } from '@/types'

function makeTotals(total: number): InvoiceTotals {
    return { subtotal: total, iva: 0, irpf: 0, expenses: 0, total }
}

function makeInvoice(overrides: Partial<Invoice>): Invoice {
    return {
        id: '1',
        user_id: 'u1',
        client_id: 'c1',
        invoice_number: 'INV-001',
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
        status: 'paid',
        submitted_to_accountant: false,
        totals: makeTotals(0),
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ...overrides,
    }
}

// ─── calculateMonthlyRevenue ─────────────────────────────────────────────────

describe('calculateMonthlyRevenue', () => {
    it('sums totals of paid invoices for the given month and year', () => {
        const invoices = [
            makeInvoice({ date: '2024-03-10', status: 'paid', totals: makeTotals(500) }),
            makeInvoice({ date: '2024-03-25', status: 'paid', totals: makeTotals(300) }),
        ]
        expect(calculateMonthlyRevenue(invoices, 2, 2024)).toBe(800)
    })

    it('excludes non-paid invoices', () => {
        const invoices = [
            makeInvoice({ date: '2024-03-10', status: 'sent', totals: makeTotals(500) }),
            makeInvoice({ date: '2024-03-10', status: 'draft', totals: makeTotals(200) }),
        ]
        expect(calculateMonthlyRevenue(invoices, 2, 2024)).toBe(0)
    })

    it('excludes paid invoices from a different month', () => {
        const invoices = [
            makeInvoice({ date: '2024-04-10', status: 'paid', totals: makeTotals(500) }),
        ]
        expect(calculateMonthlyRevenue(invoices, 2, 2024)).toBe(0)
    })

    it('excludes paid invoices from a different year', () => {
        const invoices = [
            makeInvoice({ date: '2023-03-10', status: 'paid', totals: makeTotals(500) }),
        ]
        expect(calculateMonthlyRevenue(invoices, 2, 2024)).toBe(0)
    })

    it('returns 0 for an empty list', () => {
        expect(calculateMonthlyRevenue([], 2, 2024)).toBe(0)
    })
})

// ─── getInvoicesByStatus ─────────────────────────────────────────────────────

describe('getInvoicesByStatus', () => {
    const invoices = [
        makeInvoice({ id: '1', status: 'draft' }),
        makeInvoice({ id: '2', status: 'sent' }),
        makeInvoice({ id: '3', status: 'paid' }),
        makeInvoice({ id: '4', status: 'paid' }),
        makeInvoice({ id: '5', status: 'overdue' }),
        makeInvoice({ id: '6', status: 'cancelled' }),
    ]

    it('returns only draft invoices', () => {
        expect(getInvoicesByStatus(invoices, 'draft').map(i => i.id)).toEqual(['1'])
    })

    it('returns only sent invoices', () => {
        expect(getInvoicesByStatus(invoices, 'sent').map(i => i.id)).toEqual(['2'])
    })

    it('returns multiple paid invoices', () => {
        expect(getInvoicesByStatus(invoices, 'paid').map(i => i.id)).toEqual(['3', '4'])
    })

    it('returns empty array when no invoices match the status', () => {
        expect(getInvoicesByStatus([], 'paid')).toEqual([])
    })
})

// ─── getOverdueInvoices ──────────────────────────────────────────────────────

describe('getOverdueInvoices', () => {
    it('returns sent invoices whose due date is in the past', () => {
        const invoices = [
            makeInvoice({ id: '1', status: 'sent', due_date: '2020-01-01' }),
        ]
        expect(getOverdueInvoices(invoices)).toHaveLength(1)
        expect(getOverdueInvoices(invoices)[0].id).toBe('1')
    })

    it('excludes sent invoices whose due date is in the future', () => {
        const invoices = [
            makeInvoice({ id: '1', status: 'sent', due_date: '2099-01-01' }),
        ]
        expect(getOverdueInvoices(invoices)).toHaveLength(0)
    })

    it('excludes paid invoices even if past due date', () => {
        const invoices = [
            makeInvoice({ id: '1', status: 'paid', due_date: '2020-01-01' }),
        ]
        expect(getOverdueInvoices(invoices)).toHaveLength(0)
    })

    it('excludes draft invoices even if past due date', () => {
        const invoices = [
            makeInvoice({ id: '1', status: 'draft', due_date: '2020-01-01' }),
        ]
        expect(getOverdueInvoices(invoices)).toHaveLength(0)
    })

    it('returns empty array for empty input', () => {
        expect(getOverdueInvoices([])).toEqual([])
    })
})

// ─── calculateTotalEarnings ──────────────────────────────────────────────────

describe('calculateTotalEarnings', () => {
    it('sums totals of all paid invoices', () => {
        const invoices = [
            makeInvoice({ status: 'paid', totals: makeTotals(1000) }),
            makeInvoice({ status: 'paid', totals: makeTotals(500) }),
            makeInvoice({ status: 'sent', totals: makeTotals(200) }),
        ]
        expect(calculateTotalEarnings(invoices)).toBe(1500)
    })

    it('returns 0 when there are no paid invoices', () => {
        const invoices = [
            makeInvoice({ status: 'draft', totals: makeTotals(500) }),
        ]
        expect(calculateTotalEarnings(invoices)).toBe(0)
    })

    it('returns 0 for an empty list', () => {
        expect(calculateTotalEarnings([])).toBe(0)
    })
})

// ─── getStatusColor ──────────────────────────────────────────────────────────

describe('getStatusColor', () => {
    it('returns neutral colours for draft', () => {
        const result = getStatusColor('draft')
        expect(result.bg).toBe('bg-neutral-100')
        expect(result.text).toBe('text-neutral-800')
        expect(result.label).toBe('Draft')
    })

    it('returns blue colours for sent', () => {
        const result = getStatusColor('sent')
        expect(result.bg).toBe('bg-blue-100')
        expect(result.text).toBe('text-blue-800')
        expect(result.label).toBe('Sent')
    })

    it('returns green colours for paid', () => {
        const result = getStatusColor('paid')
        expect(result.bg).toBe('bg-green-100')
        expect(result.text).toBe('text-green-800')
        expect(result.label).toBe('Paid')
    })

    it('returns red colours for overdue', () => {
        const result = getStatusColor('overdue')
        expect(result.bg).toBe('bg-red-100')
        expect(result.text).toBe('text-red-800')
        expect(result.label).toBe('Overdue')
    })

    it('returns muted neutral colours for cancelled', () => {
        const result = getStatusColor('cancelled')
        expect(result.bg).toBe('bg-neutral-100')
        expect(result.text).toBe('text-neutral-500')
        expect(result.label).toBe('Cancelled')
    })
})
