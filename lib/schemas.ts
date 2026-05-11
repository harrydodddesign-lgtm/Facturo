import { z } from 'zod'

// ─── Shared primitives ────────────────────────────────────────────────────────

const optionalEmail = z
    .union([z.string().email('Invalid email address'), z.literal('')])
    .nullable()
    .optional()

const dateString = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

const currencyCode = z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const resetPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
})

// ─── Client ───────────────────────────────────────────────────────────────────

export const clientSchema = z.object({
    name: z.string().min(1, 'Client name is required').max(200),
    client_code: z.string().max(20).default(''),
    contact: z.string().max(200).nullable().optional(),
    address: z.string().max(500).nullable().optional(),
    preferred_currency: currencyCode.default('EUR'),
    notes: z.string().max(2000).nullable().optional(),
    nif: z.string().max(30).nullable().optional(),
    email: optionalEmail,
})

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsSchema = z.object({
    invoice_prefix: z.string().min(1, 'Invoice prefix is required').max(20),
    default_iva: z.number().min(0, 'IVA cannot be negative').max(100, 'IVA cannot exceed 100%'),
    default_irpf: z.number().min(0, 'IRPF cannot be negative').max(100, 'IRPF cannot exceed 100%'),
    accountant_mode: z.boolean().default(false),
    company_name: z.string().max(200).nullable().optional(),
    company_address: z.string().max(500).nullable().optional(),
    tax_id: z.string().max(30).nullable().optional(),
    company_email: optionalEmail,
    company_phone: z.string().max(30).nullable().optional(),
    bank_name: z.string().max(100).nullable().optional(),
    iban: z.string().max(34).nullable().optional(),
    swift_bic: z.string().max(11).nullable().optional(),
    payment_terms: z.number().int().min(0).nullable().optional(),
    invoice_footer: z.string().max(2000).nullable().optional(),
})

// ─── Invoice ──────────────────────────────────────────────────────────────────

const lineItemSchema = z.object({
    description: z.string().min(1, 'Description is required').max(500),
    quantity: z.number().positive('Quantity must be greater than 0'),
    unit_price: z.number().min(0, 'Unit price cannot be negative'),
    is_expense: z.boolean().optional(),
})

const invoiceTotalsSchema = z.object({
    subtotal: z.number(),
    iva: z.number(),
    irpf: z.number(),
    expenses: z.number(),
    total: z.number(),
})

export const invoiceSchema = z.object({
    client_id: z.string().uuid('Invalid client ID'),
    invoice_number: z.string().min(1, 'Invoice number is required').max(50),
    date: dateString,
    due_date: dateString,
    line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
    primary_currency: currencyCode,
    secondary_currency: currencyCode.nullable().optional(),
    exchange_rate_used: z.number().positive().nullable().optional(),
    show_secondary_currency: z.boolean().default(false),
    show_iva: z.boolean().default(true),
    show_payment_details: z.boolean().default(false),
    payment_details: z.string().max(1000).nullable().optional(),
    show_notes: z.boolean().default(false),
    notes: z.string().max(2000).nullable().optional(),
    status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
    totals: invoiceTotalsSchema,
})

export const invoiceStatusSchema = z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])

// ─── Helper ───────────────────────────────────────────────────────────────────

export function formatZodError(error: z.ZodError): string {
    return error.issues.map(i => i.message).join(', ')
}
