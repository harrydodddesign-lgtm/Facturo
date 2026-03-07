import { createClient } from '@/lib/supabase/server'
import { Client, Invoice, Settings, Template } from '@/types'
import { cookies } from 'next/headers'
import { MOCK_CLIENTS, MOCK_INVOICES, MOCK_SETTINGS, MOCK_TEMPLATES } from './mock-data'

async function isDemoMode() {
    const cookieStore = await cookies()
    return cookieStore.get('demo_mode')?.value === 'true'
}

export async function getClients(): Promise<Client[]> {
    if (await isDemoMode()) return MOCK_CLIENTS

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Client[]
}

export async function getClient(id: string): Promise<Client | undefined> {
    if (await isDemoMode()) return MOCK_CLIENTS.find(c => c.id === id)

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Client
}

export async function getTemplates(): Promise<Template[]> {
    if (await isDemoMode()) return MOCK_TEMPLATES

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Template[]
}

export async function getTemplate(id: string): Promise<Template | undefined> {
    if (await isDemoMode()) return MOCK_TEMPLATES.find(t => t.id === id)

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Template
}

export async function getSettings(): Promise<Settings | null> {
    if (await isDemoMode()) return MOCK_SETTINGS

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "The result contains 0 rows"
    return data as Settings | null
}

export async function getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    if (await isDemoMode()) return MOCK_INVOICES.filter(i => i.client_id === clientId)

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(*), template:templates(*)')
        .eq('client_id', clientId)
        .order('date', { ascending: false })

    if (error) throw error
    return data as Invoice[]
}

export async function getInvoices(): Promise<Invoice[]> {
    if (await isDemoMode()) return MOCK_INVOICES

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .select(`
      *,
      client:clients(*),
      template:templates(*)
    `)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Invoice[]
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
    if (await isDemoMode()) return MOCK_INVOICES.find(i => i.id === id)

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .select(`
      *,
      client:clients(*),
      template:templates(*)
    `)
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Invoice
}
