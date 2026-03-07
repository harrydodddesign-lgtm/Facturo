import { InvoiceLineItem, InvoiceTotals } from '@/types'

export function calculateTotals(
    lineItems: InvoiceLineItem[],
    ivaPercentage: number,
    irpfPercentage: number
): InvoiceTotals {
    const subtotal = lineItems.reduce((sum, item) => {
        if (item.is_expense) return sum
        return sum + (item.quantity * item.unit_price)
    }, 0)

    const expenses = lineItems.reduce((sum, item) => {
        if (!item.is_expense) return sum
        return sum + (item.quantity * item.unit_price)
    }, 0)

    const iva = subtotal * (ivaPercentage / 100)
    const irpf = subtotal * (irpfPercentage / 100)

    // Total = Subtotal + IVA - IRPF + Expenses
    const total = subtotal + iva - irpf + expenses

    return {
        subtotal,
        iva,
        irpf,
        expenses,
        total
    }
}
