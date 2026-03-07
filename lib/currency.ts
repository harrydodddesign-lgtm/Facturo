export const CURRENCIES = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
]

export function formatCurrency(amount: number, currencyCode: string = 'EUR'): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currencyCode,
    }).format(amount)
}

export async function fetchExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1

    // In a real app, use a reliable API like OpenExchangeRates or similar.
    // For this demo, we'll mock some rates or use a free public API if available without key.
    // Frankfurt API is free and reliable for ECB rates.

    try {
        const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`)
        if (!res.ok) throw new Error('Failed to fetch rate')
        const data = await res.json()
        return data.rates[to]
    } catch (error) {
        console.error('Error fetching exchange rate:', error)
        return 1 // Fallback
    }
}

export function convertCurrency(amount: number, rate: number): number {
    return amount * rate
}
