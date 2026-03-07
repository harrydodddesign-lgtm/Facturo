'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Client, Invoice, Settings, Template } from '@/types'
import { cookies } from 'next/headers'

async function isDemoMode() {
    const cookieStore = await cookies()
    return cookieStore.get('demo_mode')?.value === 'true'
}

// CLIENTS

export async function createClientAction(data: any) {
    if (await isDemoMode()) {
        revalidatePath('/app/clients')
        redirect('/app/clients?success=1')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('clients').insert({
        ...data,
        user_id: user.id,
    })

    if (error) throw error
    revalidatePath('/app/clients')
    redirect('/app/clients?success=1')
}

export async function updateClientAction(id: string, data: any) {
    if (await isDemoMode()) {
        revalidatePath('/app/clients')
        revalidatePath(`/app/clients/${id}`)
        redirect('/app/clients?success=1')
    }

    const supabase = await createClient()
    const { error } = await supabase.from('clients').update(data).eq('id', id)

    if (error) throw error
    revalidatePath('/app/clients')
    revalidatePath(`/app/clients/${id}`)
    redirect('/app/clients?success=1')
}

export async function deleteClientAction(id: string) {
    if (await isDemoMode()) {
        revalidatePath('/app/clients')
        redirect('/app/clients?success=1')
    }

    const supabase = await createClient()
    const { error } = await supabase.from('clients').delete().eq('id', id)

    if (error) throw error
    revalidatePath('/app/clients')
    redirect('/app/clients?success=1')
}

// TEMPLATES

export async function createTemplateAction(data: any) {
    if (await isDemoMode()) {
        revalidatePath('/app/templates')
        redirect('/app/templates')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('templates').insert({
        ...data,
        user_id: user.id,
    })

    if (error) throw error
    revalidatePath('/app/templates')
    redirect('/app/templates')
}

export async function updateTemplateAction(id: string, data: any) {
    if (await isDemoMode()) {
        revalidatePath('/app/templates')
        revalidatePath(`/app/templates/${id}`)
        redirect('/app/templates')
    }

    const supabase = await createClient()
    const { error } = await supabase.from('templates').update(data).eq('id', id)

    if (error) throw error
    revalidatePath('/app/templates')
    revalidatePath(`/app/templates/${id}`)
    redirect('/app/templates')
}

export async function deleteTemplateAction(id: string) {
    if (await isDemoMode()) {
        revalidatePath('/app/templates')
        redirect('/app/templates?success=1')
    }

    const supabase = await createClient()
    const { error } = await supabase.from('templates').delete().eq('id', id)

    if (error) throw error
    revalidatePath('/app/templates')
    redirect('/app/templates?success=1')
}

// SETTINGS

export async function updateSettingsAction(data: any) {
    if (await isDemoMode()) {
        revalidatePath('/app/settings')
        return
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if settings exist
    const { data: existing } = await supabase.from('settings').select('id').eq('user_id', user.id).single()

    if (existing) {
        const { error } = await supabase.from('settings').update(data).eq('user_id', user.id)
        if (error) throw error
    } else {
        const { error } = await supabase.from('settings').insert({
            ...data,
            user_id: user.id,
        })
        if (error) throw error
    }

    revalidatePath('/app/settings')
}

// INVOICES

export async function createInvoiceAction(data: any) {
    if (await isDemoMode()) {
        revalidatePath('/app/invoices')
        redirect('/app/invoices')
    }

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
    redirect('/app/invoices')
}

export async function updateInvoiceAction(id: string, data: any) {
    if (await isDemoMode()) {
        revalidatePath('/app/invoices')
        revalidatePath(`/app/invoices/${id}`)
        redirect('/app/invoices')
    }

    const supabase = await createClient()
    const { error } = await supabase.from('invoices').update(data).eq('id', id)

    if (error) throw error
    revalidatePath('/app/invoices')
    revalidatePath(`/app/invoices/${id}`)
    redirect('/app/invoices')
}

export async function updateInvoiceStatusAction(id: string, status: string) {
    if (await isDemoMode()) {
        revalidatePath('/app/invoices')
        return
    }

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
    if (await isDemoMode()) {
        revalidatePath('/app/invoices')
        return
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('invoices')
        .update({ submitted_to_accountant: value })
        .eq('id', id)

    if (error) throw error
    revalidatePath('/app/invoices')
    revalidatePath(`/app/invoices/${id}`)
}

export async function deleteInvoiceAction(id: string) {
    if (await isDemoMode()) {
        revalidatePath('/app/invoices')
        redirect('/app/invoices?success=1')
    }

    const supabase = await createClient()
    const { error } = await supabase.from('invoices').delete().eq('id', id)

    if (error) throw error
    revalidatePath('/app/invoices')
    redirect('/app/invoices?success=1')
}
