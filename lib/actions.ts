'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
    clientSchema,
    invoiceSchema,
    invoiceStatusSchema,
    settingsSchema,
    formatZodError,
} from '@/lib/schemas'

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function createClientAction(data: unknown) {
    const result = clientSchema.safeParse(data)
    if (!result.success) throw new Error(formatZodError(result.error))

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('clients').insert({ ...result.data, user_id: user.id })
    if (error) throw error
    revalidatePath('/app/clients')
    redirect('/app/clients?success=1')
}

export async function updateClientAction(id: string, data: unknown) {
    const result = clientSchema.safeParse(data)
    if (!result.success) throw new Error(formatZodError(result.error))

    const supabase = await createClient()
    const { error } = await supabase.from('clients').update(result.data).eq('id', id)
    if (error) throw error
    revalidatePath('/app/clients')
    revalidatePath(`/app/clients/${id}`)
    redirect(`/app/clients/${id}?success=1`)
}

export async function deleteClientAction(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/app/clients')
    redirect('/app/clients?success=1')
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function updateSettingsAction(data: unknown) {
    const result = settingsSchema.safeParse(data)
    if (!result.success) throw new Error(formatZodError(result.error))

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: existing } = await supabase.from('settings').select('id').eq('user_id', user.id).single()

    if (existing) {
        const { error } = await supabase.from('settings').update(result.data).eq('user_id', user.id)
        if (error) throw error
    } else {
        const { error } = await supabase.from('settings').insert({ ...result.data, user_id: user.id })
        if (error) throw error
    }

    revalidatePath('/app/settings')
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function createInvoiceAction(data: unknown) {
    const result = invoiceSchema.safeParse(data)
    if (!result.success) throw new Error(formatZodError(result.error))

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('invoices').insert({
        ...result.data,
        user_id: user.id,
    })
    if (error) throw error
    revalidatePath('/app/invoices')
    redirect('/app/invoices?success=1')
}

export async function updateInvoiceAction(id: string, data: unknown) {
    const result = invoiceSchema.safeParse(data)
    if (!result.success) throw new Error(formatZodError(result.error))

    const supabase = await createClient()
    const { error } = await supabase.from('invoices').update(result.data).eq('id', id)
    if (error) throw error
    revalidatePath('/app/invoices')
    revalidatePath(`/app/invoices/${id}`)
    redirect(`/app/invoices/${id}?success=1`)
}

export async function updateInvoiceStatusAction(id: string, status: string) {
    const result = invoiceStatusSchema.safeParse(status)
    if (!result.success) throw new Error(`Invalid status: ${status}`)

    const supabase = await createClient()
    const now = new Date().toISOString()
    const update: Record<string, unknown> = { status: result.data }
    if (result.data === 'sent') update.sent_at = now
    if (result.data === 'paid') update.paid_at = now

    const { error } = await supabase.from('invoices').update(update).eq('id', id)
    if (error) throw error
    revalidatePath('/app/invoices')
    revalidatePath(`/app/invoices/${id}`)
}

export async function toggleAccountantSubmittedAction(id: string, value: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('invoices')
        .update({ submitted_to_accountant: value })
        .eq('id', id)
    if (error) throw error
    revalidatePath('/app/invoices')
    revalidatePath(`/app/invoices/${id}`)
}

export async function duplicateInvoiceAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: original, error: fetchError } = await supabase
        .from('invoices').select('*').eq('id', id).single()
    if (fetchError || !original) throw new Error('Invoice not found')

    const today = new Date().toISOString().split('T')[0]

    const { data: copy, error } = await supabase
        .from('invoices')
        .insert({
            user_id: user.id,
            client_id: original.client_id,
            invoice_number: `${original.invoice_number}-COPY`,
            date: today,
            due_date: today,
            line_items: original.line_items,
            primary_currency: original.primary_currency,
            secondary_currency: original.secondary_currency,
            exchange_rate_used: original.exchange_rate_used,
            show_secondary_currency: original.show_secondary_currency,
            show_iva: original.show_iva,
            show_payment_details: original.show_payment_details,
            payment_details: original.payment_details,
            show_notes: original.show_notes,
            notes: original.notes,
            totals: original.totals,
            status: 'draft',
            submitted_to_accountant: false,
        })
        .select('id')
        .single()

    if (error) throw error
    revalidatePath('/app/invoices')
    redirect(`/app/invoices/${copy.id}`)
}

export async function deleteInvoiceAction(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/app/invoices')
    redirect('/app/invoices?success=1')
}
