'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// CLIENTS

export async function createClientAction(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('clients').insert({ ...data, user_id: user.id })
    if (error) throw error
    revalidatePath('/app/clients')
    redirect('/app/clients?success=1')
}

export async function updateClientAction(id: string, data: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('clients').update(data).eq('id', id)
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

// SETTINGS

export async function updateSettingsAction(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: existing } = await supabase.from('settings').select('id').eq('user_id', user.id).single()

    if (existing) {
        const { error } = await supabase.from('settings').update(data).eq('user_id', user.id)
        if (error) throw error
    } else {
        const { error } = await supabase.from('settings').insert({ ...data, user_id: user.id })
        if (error) throw error
    }

    revalidatePath('/app/settings')
}

// INVOICES

export async function createInvoiceAction(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('invoices').insert({
        ...data,
        user_id: user.id,
        status: data.status || 'draft',
    })
    if (error) throw error
    revalidatePath('/app/invoices')
    redirect('/app/invoices?success=1')
}

export async function updateInvoiceAction(id: string, data: any) {
    const supabase = await createClient()
    const { error } = await supabase.from('invoices').update(data).eq('id', id)
    if (error) throw error
    revalidatePath('/app/invoices')
    revalidatePath(`/app/invoices/${id}`)
    redirect(`/app/invoices/${id}?success=1`)
}

export async function updateInvoiceStatusAction(id: string, status: string) {
    const supabase = await createClient()
    const now = new Date().toISOString()
    const update: Record<string, any> = { status }
    if (status === 'sent') update.sent_at = now
    if (status === 'paid') update.paid_at = now

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
