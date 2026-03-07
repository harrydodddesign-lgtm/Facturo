export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Client {
  id: string
  user_id: string
  name: string
  contact: string | null
  address: string | null
  preferred_currency: string
  client_code: string
  notes: string | null
  nif: string | null
  email: string | null
  created_at: string
  updated_at: string
}


export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  is_expense?: boolean
}

export interface InvoiceTotals {
  subtotal: number
  iva: number
  irpf: number
  expenses: number
  total: number
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  template_id?: string | null
  invoice_number: string
  date: string
  due_date: string
  line_items: InvoiceLineItem[]
  primary_currency: string
  secondary_currency: string | null
  exchange_rate_used: number | null
  show_secondary_currency: boolean
  show_iva: boolean
  show_payment_details: boolean
  payment_details: string | null
  show_notes: boolean
  notes: string | null
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  sent_at?: string | null
  paid_at?: string | null
  submitted_to_accountant: boolean
  date_paid?: string | null
  payment_method?: string | null
  totals: InvoiceTotals
  created_at: string
  updated_at: string

  // Joined fields
  client?: Client
}

export interface Settings {
  id: string
  user_id: string
  invoice_prefix: string
  default_iva: number
  default_irpf: number
  accountant_mode: boolean
  company_name: string | null
  company_address: string | null
  tax_id: string | null
  company_email: string | null
  company_phone: string | null
  bank_name: string | null
  iban: string | null
  swift_bic: string | null
  payment_terms: number | null
  invoice_footer: string | null
  created_at: string
  updated_at: string
}
