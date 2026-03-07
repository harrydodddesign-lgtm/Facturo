import { getInvoice, getClients, getTemplates, getSettings } from '@/lib/data'
import { InvoiceForm } from '../invoice-form'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [invoice, clients, templates, settings] = await Promise.all([
        getInvoice(id),
        getClients(),
        getTemplates(),
        getSettings()
    ])

    return (
        <InvoiceForm
            invoice={invoice}
            clients={clients}
            templates={templates}
            settings={settings}
        />
    )
}
