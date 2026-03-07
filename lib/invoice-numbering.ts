import { createClient } from '@/lib/supabase/server'
import { getClient } from '@/lib/data'

export async function generateInvoiceNumber(clientId: string, dateStr: string) {
    const supabase = await createClient()
    const client = await getClient(clientId)

    if (!client) throw new Error('Client not found')

    const date = new Date(dateStr)
    const year = date.getFullYear()
    const clientCode = client.client_code

    // Generate abbreviation from name if client_code is missing or just use client_code
    // User asked for abbreviation of name. Let's assume client_code IS that, or generate one.
    // For now, we'll use client_code as the prefix.
    const prefix = clientCode ? clientCode.toUpperCase() : client.name.substring(0, 3).toUpperCase()

    // Pattern: PREFIX-YYYY-%
    const pattern = `${prefix}-${year}-%`

    // Find the highest sequence for this pattern
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .like('invoice_number', pattern)
        .order('invoice_number', { ascending: false })
        .limit(1)

    if (error) throw error

    let nextSequence = 1

    if (invoices && invoices.length > 0) {
        const lastNumber = invoices[0].invoice_number
        const parts = lastNumber.split('-')
        const lastSequenceStr = parts[parts.length - 1]
        const lastSequence = parseInt(lastSequenceStr, 10)

        if (!isNaN(lastSequence)) {
            nextSequence = lastSequence + 1
        }
    }

    // Format: PREFIX-YYYY-00X
    const sequenceStr = nextSequence.toString().padStart(3, '0')
    return `${prefix}-${year}-${sequenceStr}`
}
