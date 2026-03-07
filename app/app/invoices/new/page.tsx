import { getClients, getSettings } from '@/lib/data'
import { InvoiceForm } from '../invoice-form'
import { Client, Settings } from '@/types'

export const dynamic = 'force-dynamic'

export default async function NewInvoicePage() {
    let clients: Client[] = []
    let settings: Settings | null = null

    try {
        ;[clients, settings] = await Promise.all([getClients(), getSettings()])
    } catch (error) {
        console.error('Failed to fetch data:', error)
    }

    return <InvoiceForm clients={clients} settings={settings} />
}
