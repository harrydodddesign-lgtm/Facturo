import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatCurrency, fetchExchangeRate, convertCurrency } from '@/lib/currency'

describe('formatCurrency', () => {
    it('formats a EUR amount using Spanish locale', () => {
        const result = formatCurrency(1234.56, 'EUR')
        expect(result).toContain('€')
        expect(result).toMatch(/1[.,]?234[.,]56/)
    })

    it('defaults to EUR when no currency code is provided', () => {
        expect(formatCurrency(100)).toContain('€')
    })

    it('formats a USD amount', () => {
        const result = formatCurrency(100, 'USD')
        expect(result).toContain('100')
        expect(result).toContain('$')
    })

    it('formats a GBP amount', () => {
        const result = formatCurrency(50, 'GBP')
        expect(result).toContain('50')
        // Node ICU data may render GBP as '£' or 'GBP' depending on build
        expect(result).toMatch(/£|GBP/)
    })

    it('treats NaN as 0', () => {
        const result = formatCurrency(NaN, 'EUR')
        expect(result).toContain('0,00')
        expect(result).toContain('€')
    })

    it('treats Infinity as 0', () => {
        const result = formatCurrency(Infinity, 'EUR')
        expect(result).toContain('0,00')
        expect(result).toContain('€')
    })

    it('formats negative amounts', () => {
        const result = formatCurrency(-250, 'EUR')
        expect(result).toContain('250')
        expect(result).toContain('€')
    })

    it('formats zero', () => {
        const result = formatCurrency(0, 'EUR')
        expect(result).toContain('0,00')
    })
})

describe('convertCurrency', () => {
    it('multiplies amount by rate', () => {
        expect(convertCurrency(100, 1.1)).toBeCloseTo(110)
    })

    it('returns 0 for a zero amount', () => {
        expect(convertCurrency(0, 1.5)).toBe(0)
    })

    it('returns the original amount for a rate of 1', () => {
        expect(convertCurrency(250, 1)).toBe(250)
    })

    it('handles fractional rates', () => {
        expect(convertCurrency(200, 0.5)).toBe(100)
    })
})

describe('fetchExchangeRate', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('returns 1 when from and to currency are the same', async () => {
        expect(await fetchExchangeRate('EUR', 'EUR')).toBe(1)
        expect(await fetchExchangeRate('USD', 'USD')).toBe(1)
    })

    it('returns the rate from the API response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ rates: { USD: 1.08 } }),
        }))
        expect(await fetchExchangeRate('EUR', 'USD')).toBe(1.08)
    })

    it('returns 1 as fallback when the API response is not ok', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
        expect(await fetchExchangeRate('EUR', 'USD')).toBe(1)
    })

    it('returns 1 as fallback when fetch throws a network error', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
        expect(await fetchExchangeRate('EUR', 'USD')).toBe(1)
    })
})
