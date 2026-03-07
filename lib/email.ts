'use server'

import { Resend } from 'resend'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { InvoicePDF } from '@/components/pdf/invoice-pdf'
import { Invoice, Client, Settings } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvoiceEmail({
    invoice,
    client,
    settings,
    to,
    subject,
    message,
}: {
    invoice: Invoice
    client: Client
    settings: Settings | null
    to: string
    subject: string
    message?: string
}) {
    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
        React.createElement(InvoicePDF, { invoice, client, settings }) as any
    )

    const from = settings?.company_email
        ? `${settings.company_name || 'Facturo'} <${settings.company_email}>`
        : 'Facturo <noreply@facturo.app>'

    const bodyText = message
        ? `${message}\n\nPlease find your invoice attached.`
        : `Please find invoice ${invoice.invoice_number} attached.`

    const { error } = await resend.emails.send({
        from,
        to,
        subject,
        text: bodyText,
        attachments: [
            {
                filename: `${invoice.invoice_number}.pdf`,
                content: pdfBuffer,
            },
        ],
    })

    if (error) throw new Error(error.message)

    // Mark invoice as sent
    const supabase = await createClient()
    await supabase
        .from('invoices')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', invoice.id)

    revalidatePath('/app/invoices')
    revalidatePath(`/app/invoices/${invoice.id}`)
}
