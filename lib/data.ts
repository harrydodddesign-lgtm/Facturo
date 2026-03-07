import { createClient } from '@/lib/supabase/server'
import { Client, Invoice, Settings } from '@/types'

export async function getClients(): Promise<Client[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Client[]
}

export async function getClient(id: string): Promise<Client | undefined> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Client
}

export async function getSettings(): Promise<Settings | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Settings | null
}

export async function getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(*)')
        .eq('client_id', clientId)
        .order('date', { ascending: false })

    if (error) throw error
    return data as Invoice[]
}

export async function getInvoices(): Promise<Invoice[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(*)')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Invoice[]
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(*)')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Invoice
}
