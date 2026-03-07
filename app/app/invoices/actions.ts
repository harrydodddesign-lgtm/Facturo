'use server'

import { generateInvoiceNumber } from '@/lib/invoice-numbering'
import { fetchExchangeRate } from '@/lib/currency'

export async function getNextInvoiceNumberAction(clientId: string, dateStr: string) {
    return await generateInvoiceNumber(clientId, dateStr)
}

export async function getExchangeRateAction(from: string, to: string) {
    return await fetchExchangeRate(from, to)
}
