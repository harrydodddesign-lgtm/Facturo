import { getClients, getTemplates, getSettings } from '@/lib/data'
import { InvoiceForm } from '../invoice-form'
import { Client, Template, Settings } from '@/types'

export const dynamic = 'force-dynamic'

export default async function NewInvoicePage() {
    let clients: Client[] = []
    let templates: Template[] = []
    let settings: Settings | null = null

    try {
        [clients, templates, settings] = await Promise.all([
            getClients(),
            getTemplates(),
            getSettings()
        ])
    } catch (error) {
        console.error('Failed to fetch data, using mocks:', error)
        // Mock data for preview
        clients = [{
            id: 'mock-client-1',
            user_id: 'mock-user',
            name: 'Mock Client',
            contact: 'mock@example.com',
            address: '123 Mock St',
            preferred_currency: 'EUR',
            client_code: 'MOCK001',
            notes: 'Mock notes',
            nif: null,
            email: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }]
    }

    return (
        <InvoiceForm clients={clients} templates={templates} settings={settings} />
    )
}
