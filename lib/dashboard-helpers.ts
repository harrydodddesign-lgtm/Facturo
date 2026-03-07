import { Invoice } from '@/types'

/**
 * Calculate total revenue for a specific month and year from invoices
 */
export function calculateMonthlyRevenue(
    invoices: Invoice[],
    month: number, // 0-11 (January = 0)
    year: number
): number {
    return invoices
        .filter(invoice => {
            const invoiceDate = new Date(invoice.date)
            return invoiceDate.getMonth() === month &&
                invoiceDate.getFullYear() === year &&
                (invoice.status === 'paid' || invoice.status === 'sent')
        })
        .reduce((total, invoice) => total + invoice.totals.total, 0)
}

/**
 * Filter invoices by status
 */
export function getInvoicesByStatus(
    invoices: Invoice[],
    status: Invoice['status']
): Invoice[] {
    return invoices.filter(invoice => invoice.status === status)
}

/**
 * Get invoices that are past due date and not paid
 */
export function getOverdueInvoices(invoices: Invoice[]): Invoice[] {
    const now = new Date()
    return invoices.filter(invoice => {
        if (invoice.status === 'paid' || invoice.status === 'cancelled') {
            return false
        }
        const dueDate = new Date(invoice.due_date)
        return dueDate < now
    })
}

/**
 * Calculate total earnings across all paid invoices
 */
export function calculateTotalEarnings(invoices: Invoice[]): number {
    return invoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((total, invoice) => total + invoice.totals.total, 0)
}

/**
 * Get status badge color
 */
export function getStatusColor(status: Invoice['status']): {
    bg: string
    text: string
    label: string
} {
    switch (status) {
        case 'draft':
            return {
                bg: 'bg-neutral-100',
                text: 'text-neutral-800',
                label: 'Draft'
            }
        case 'sent':
            return {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                label: 'Sent'
            }
        case 'paid':
            return {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: 'Paid'
            }
        case 'overdue':
            return {
                bg: 'bg-red-100',
                text: 'text-red-800',
                label: 'Overdue'
            }
        case 'cancelled':
            return {
                bg: 'bg-neutral-100',
                text: 'text-neutral-500',
                label: 'Cancelled'
            }
    }
}
