import { getInvoice, getClients, getSettings } from '@/lib/data'
import { InvoiceForm } from '../invoice-form'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [invoice, clients, settings] = await Promise.all([
        getInvoice(id),
        getClients(),
        getSettings()
    ])

    return (
        <InvoiceForm
            invoice={invoice}
            clients={clients}
            settings={settings}
        />
    )
}
