import { describe, it, expect } from 'vitest'
import { calculateTotals } from '@/lib/tax'
import { InvoiceLineItem } from '@/types'

function item(quantity: number, unit_price: number, is_expense = false): InvoiceLineItem {
    return { description: 'Item', quantity, unit_price, is_expense }
}

describe('calculateTotals', () => {
    it('returns all zeros for empty line items', () => {
        expect(calculateTotals([], 21, 15)).toEqual({
            subtotal: 0,
            iva: 0,
            irpf: 0,
            expenses: 0,
            total: 0,
        })
    })

    it('calculates subtotal from non-expense line items only', () => {
        const result = calculateTotals([item(2, 100), item(1, 50)], 0, 0)
        expect(result.subtotal).toBe(250)
    })

    it('excludes expense items from subtotal', () => {
        const result = calculateTotals([item(1, 100), item(1, 50, true)], 0, 0)
        expect(result.subtotal).toBe(100)
        expect(result.expenses).toBe(50)
    })

    it('calculates IVA as a percentage of subtotal', () => {
        const result = calculateTotals([item(1, 100)], 21, 0)
        expect(result.iva).toBe(21)
    })

    it('does not apply IVA to expenses', () => {
        const result = calculateTotals([item(1, 100), item(1, 200, true)], 21, 0)
        expect(result.iva).toBe(21)
    })

    it('calculates IRPF as a percentage of subtotal', () => {
        const result = calculateTotals([item(1, 100)], 0, 15)
        expect(result.irpf).toBe(15)
    })

    it('does not apply IRPF to expenses', () => {
        const result = calculateTotals([item(1, 100), item(1, 200, true)], 0, 15)
        expect(result.irpf).toBe(15)
    })

    it('computes total as subtotal + iva - irpf + expenses', () => {
        // subtotal=1000, iva=210, irpf=150, expenses=0 => total=1060
        const result = calculateTotals([item(2, 500)], 21, 15)
        expect(result.total).toBe(1060)
    })

    it('adds expenses to total without applying tax', () => {
        // subtotal=100, iva=21, irpf=0, expenses=50 => total=171
        const result = calculateTotals([item(1, 100), item(1, 50, true)], 21, 0)
        expect(result.total).toBe(171)
    })

    it('handles zero IVA and IRPF', () => {
        const result = calculateTotals([item(1, 100)], 0, 0)
        expect(result.total).toBe(100)
    })

    it('handles line items where is_expense is undefined (treated as non-expense)', () => {
        const lineItem: InvoiceLineItem = { description: 'X', quantity: 1, unit_price: 100 }
        const result = calculateTotals([lineItem], 0, 0)
        expect(result.subtotal).toBe(100)
        expect(result.expenses).toBe(0)
    })

    it('accumulates multiple expense items', () => {
        const result = calculateTotals([item(1, 30, true), item(2, 20, true)], 0, 0)
        expect(result.expenses).toBe(70)
        expect(result.subtotal).toBe(0)
        expect(result.total).toBe(70)
    })
})
