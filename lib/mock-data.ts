import { Client, Invoice, Settings, Template } from '@/types'

export const MOCK_CLIENTS: Client[] = [
    {
        id: 'mock-client-1',
        user_id: 'mock-user',
        name: 'Acme Corp',
        contact: 'John Smith',
        address: '123 Innovation Dr, Tech City',
        client_code: 'ACM',
        preferred_currency: 'EUR',
        notes: 'Big client',
        nif: 'B12345678',
        email: 'contact@acme.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'mock-client-2',
        user_id: 'mock-user',
        name: 'Globex Corporation',
        contact: 'Hank Scorpio',
        address: '456 Cypress Creek',
        client_code: 'GLO',
        preferred_currency: 'USD',
        notes: 'International',
        nif: null,
        email: 'hank@globex.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

export const MOCK_TEMPLATES: Template[] = [
    {
        id: 'mock-template-1',
        user_id: 'mock-user',
        name: 'Standard Clean',
        layout: 'minimal', // fixed enum
        fields: { // added missing fields object
            showIVA: true,
            showIRPF: true,
            showFooterNotes: true,
            showSecondaryCurrency: false
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString() // added missing field
    }
]

export const MOCK_SETTINGS: Settings = {
    id: 'mock-settings',
    user_id: 'mock-user',
    invoice_prefix: 'INV',
    default_iva: 21,
    default_irpf: 15,
    accountant_mode: false,
    company_name: 'Demo Freelancer S.L.',
    company_address: 'Calle Mayor 1, 28001 Madrid',
    tax_id: 'B87654321',
    company_email: 'demo@facturo.app',
    company_phone: '+34 600 000 000',
    bank_name: 'Banco Santander',
    iban: 'ES00 0000 0000 0000 0000 0000',
    swift_bic: 'BSCHESMMXXX',
    payment_terms: 30,
    invoice_footer: 'Gracias por su confianza.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
}

export const MOCK_INVOICES: Invoice[] = [
    {
        id: 'mock-invoice-1',
        user_id: 'mock-user',
        client_id: 'mock-client-1',
        template_id: 'mock-template-1',
        invoice_number: 'INV-2024-ACM-001',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
        due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago (overdue)
        status: 'overdue',
        submitted_to_accountant: false,
        line_items: [
            { description: 'Consulting Services', quantity: 10, unit_price: 100 }
        ],
        totals: {
            subtotal: 1000,
            iva: 210,
            irpf: 150,
            expenses: 0,
            total: 1060
        },
        primary_currency: 'EUR',
        secondary_currency: null,
        exchange_rate_used: 1,
        show_secondary_currency: false,
        show_iva: true,
        show_payment_details: false,
        payment_details: null,
        show_notes: false,
        notes: null,
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        client: MOCK_CLIENTS[0]
    },
    {
        id: 'mock-invoice-2',
        user_id: 'mock-user',
        client_id: 'mock-client-2',
        template_id: 'mock-template-1',
        invoice_number: 'INV-2024-GLO-001',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        due_date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'paid',
        submitted_to_accountant: true,
        date_paid: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'Bank Transfer',
        line_items: [
            { description: 'Web Design', quantity: 1, unit_price: 2500 }
        ],
        totals: {
            subtotal: 2500,
            iva: 525,
            irpf: 375,
            expenses: 0,
            total: 2650
        },
        primary_currency: 'EUR',
        secondary_currency: null,
        exchange_rate_used: 1,
        show_secondary_currency: false,
        show_iva: true,
        show_payment_details: true,
        payment_details: 'Bank: Example Bank\nIBAN: ES00 0000 0000 0000',
        show_notes: false,
        notes: null,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        client: MOCK_CLIENTS[1]
    },
    {
        id: 'mock-invoice-3',
        user_id: 'mock-user',
        client_id: 'mock-client-1',
        template_id: 'mock-template-1',
        invoice_number: 'INV-2024-ACM-002',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
        status: 'sent',
        submitted_to_accountant: false,
        line_items: [
            { description: 'Monthly Retainer', quantity: 1, unit_price: 1500 }
        ],
        totals: {
            subtotal: 1500,
            iva: 315,
            irpf: 225,
            expenses: 0,
            total: 1590
        },
        primary_currency: 'EUR',
        secondary_currency: null,
        exchange_rate_used: 1,
        show_secondary_currency: false,
        show_iva: true,
        show_payment_details: true,
        payment_details: 'Bank: Example Bank\nIBAN: ES00 0000 0000 0000',
        show_notes: false,
        notes: null,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        client: MOCK_CLIENTS[0]
    },
    {
        id: 'mock-invoice-4',
        user_id: 'mock-user',
        client_id: 'mock-client-2',
        template_id: 'mock-template-1',
        invoice_number: 'INV-2024-GLO-002',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        submitted_to_accountant: false,
        line_items: [
            { description: 'Logo Design', quantity: 1, unit_price: 800 },
            { description: 'Brand Guidelines', quantity: 1, unit_price: 600 }
        ],
        totals: {
            subtotal: 1400,
            iva: 294,
            irpf: 210,
            expenses: 0,
            total: 1484
        },
        primary_currency: 'EUR',
        secondary_currency: null,
        exchange_rate_used: 1,
        show_secondary_currency: false,
        show_iva: true,
        show_payment_details: true,
        payment_details: 'Bank: Example Bank\nIBAN: ES00 0000 0000 0000',
        show_notes: false,
        notes: null,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        client: MOCK_CLIENTS[1]
    },
    {
        id: 'mock-invoice-5',
        user_id: 'mock-user',
        client_id: 'mock-client-1',
        template_id: 'mock-template-1',
        invoice_number: 'INV-2024-ACM-003',
        date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'draft',
        submitted_to_accountant: false,
        line_items: [
            { description: 'Development Work', quantity: 20, unit_price: 85 }
        ],
        totals: {
            subtotal: 1700,
            iva: 357,
            irpf: 255,
            expenses: 0,
            total: 1802
        },
        primary_currency: 'EUR',
        secondary_currency: null,
        exchange_rate_used: 1,
        show_secondary_currency: false,
        show_iva: true,
        show_payment_details: false,
        payment_details: null,
        show_notes: false,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: MOCK_CLIENTS[0]
    },
    {
        id: 'mock-invoice-6',
        user_id: 'mock-user',
        client_id: 'mock-client-1',
        template_id: 'mock-template-1',
        invoice_number: 'INV-2024-ACM-004',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago (last month)
        due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'paid',
        submitted_to_accountant: true,
        date_paid: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'Bank Transfer',
        line_items: [
            { description: 'SEO Optimization', quantity: 1, unit_price: 1200 }
        ],
        totals: {
            subtotal: 1200,
            iva: 252,
            irpf: 180,
            expenses: 0,
            total: 1272
        },
        primary_currency: 'EUR',
        secondary_currency: null,
        exchange_rate_used: 1,
        show_secondary_currency: false,
        show_iva: true,
        show_payment_details: true,
        payment_details: 'Bank: Example Bank\nIBAN: ES00 0000 0000 0000',
        show_notes: false,
        notes: null,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        client: MOCK_CLIENTS[0]
    }
]

