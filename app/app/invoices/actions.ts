'use server'

import { z } from 'zod'
import { generateInvoiceNumber } from '@/lib/invoice-numbering'
import { fetchExchangeRate } from '@/lib/currency'

const uuidSchema = z.string().uuid('Invalid ID')
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
const currencyCodeSchema = z.string().length(3, 'Currency code must be 3 characters')

export async function getNextInvoiceNumberAction(clientId: string, dateStr: string) {
    uuidSchema.parse(clientId)
    dateStringSchema.parse(dateStr)
    return await generateInvoiceNumber(clientId, dateStr)
}

export async function getExchangeRateAction(from: string, to: string) {
    currencyCodeSchema.parse(from)
    currencyCodeSchema.parse(to)
    return await fetchExchangeRate(from, to)
}
