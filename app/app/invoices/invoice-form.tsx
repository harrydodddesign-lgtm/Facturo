'use client'

import * as React from 'react'
import { Client, Invoice, InvoiceLineItem, Settings } from '@/types'
import { createInvoiceAction, updateInvoiceAction } from '@/lib/actions'
import { getNextInvoiceNumberAction, getExchangeRateAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CURRENCIES, formatCurrency } from '@/lib/currency'
import { calculateTotals } from '@/lib/tax'
import { Trash2, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PdfPreview } from '@/components/pdf/pdf-preview'
import { PDFDownloadButton } from '@/components/pdf-download-button'

interface InvoiceFormProps {
    invoice?: Invoice
    clients: Client[]
    settings: Settings | null
}

export function InvoiceForm({ invoice, clients, settings }: InvoiceFormProps) {
    const isEditing = !!invoice

    // Derive default due date from settings payment terms
    const defaultDueDate = React.useMemo(() => {
        if (invoice?.due_date) return invoice.due_date
        const days = settings?.payment_terms ?? 30
        const d = new Date()
        d.setDate(d.getDate() + days)
        return d.toISOString().split('T')[0]
    }, [])

    // Derive default payment details from settings banking info
    const settingsPaymentDetails = React.useMemo(() => {
        const parts: string[] = []
        if (settings?.bank_name) parts.push(`Bank: ${settings.bank_name}`)
        if (settings?.iban) parts.push(`IBAN: ${settings.iban}`)
        if (settings?.swift_bic) parts.push(`SWIFT/BIC: ${settings.swift_bic}`)
        return parts.join('\n')
    }, [])

    // State
    const [clientId, setClientId] = React.useState(invoice?.client_id || '')
    const [date, setDate] = React.useState(invoice?.date || new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = React.useState(defaultDueDate)
    const [invoiceNumber, setInvoiceNumber] = React.useState(invoice?.invoice_number || '')
    const [lineItems, setLineItems] = React.useState<InvoiceLineItem[]>(invoice?.line_items || [])
    const [ivaRate, setIvaRate] = React.useState(() => {
        if (invoice?.totals?.iva && invoice?.totals?.subtotal) {
            const r = (invoice.totals.iva / invoice.totals.subtotal) * 100
            return isFinite(r) ? r : (settings?.default_iva ?? 21)
        }
        return settings?.default_iva ?? 21
    })
    const [irpfRate, setIrpfRate] = React.useState(() => {
        if (invoice?.totals?.irpf && invoice?.totals?.subtotal) {
            const r = (invoice.totals.irpf / invoice.totals.subtotal) * 100
            return isFinite(r) ? r : (settings?.default_irpf ?? 15)
        }
        return settings?.default_irpf ?? 15
    })
    const [showIrpf, setShowIrpf] = React.useState(!!invoice?.totals?.irpf || false)
    const [secondaryCurrency, setSecondaryCurrency] = React.useState(invoice?.secondary_currency || '')
    const [showSecondaryCurrency, setShowSecondaryCurrency] = React.useState(invoice?.show_secondary_currency || false)
    const [exchangeRate, setExchangeRate] = React.useState(invoice?.exchange_rate_used || 1)
    const [showIva, setShowIva] = React.useState(invoice?.show_iva ?? true)
    const [showPaymentDetails, setShowPaymentDetails] = React.useState(invoice?.show_payment_details || false)
    const [paymentDetails, setPaymentDetails] = React.useState(invoice?.payment_details || settingsPaymentDetails)
    const [showNotes, setShowNotes] = React.useState(invoice?.show_notes || false)
    const [notes, setNotes] = React.useState(invoice?.notes || '')
    const [submittedToAccountant, setSubmittedToAccountant] = React.useState(invoice?.submitted_to_accountant || false)
    const [lineItemsError, setLineItemsError] = React.useState('')

    const client = clients.find(c => c.id === clientId)
    const [isDirty, setIsDirty] = React.useState(false)
    // Track whether user has manually edited the invoice number
    const invoiceNumberEdited = React.useRef(false)

    // Warn on unsaved changes
    React.useEffect(() => {
        if (!isDirty) return
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

    // Auto-generate invoice number when client or date changes (new invoices only, unless user has edited it)
    React.useEffect(() => {
        if (!isEditing && clientId && date && !invoiceNumberEdited.current) {
            getNextInvoiceNumberAction(clientId, date)
                .then(setInvoiceNumber)
                .catch(() => { /* silently ignore — user can type manually */ })
        }
    }, [clientId, date, isEditing])

    React.useEffect(() => {
        if (secondaryCurrency && secondaryCurrency !== 'EUR') {
            getExchangeRateAction('EUR', secondaryCurrency).then(setExchangeRate)
        } else {
            setExchangeRate(1)
        }
    }, [secondaryCurrency])

    // Handlers
    const addLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }])
    }

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index))
    }

    const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
        const newItems = [...lineItems]
        newItems[index] = { ...newItems[index], [field]: value }
        setLineItems(newItems)
    }

    // Calculations
    const totals = calculateTotals(lineItems, ivaRate, showIrpf ? irpfRate : 0)
    const secondaryTotal = totals.total * exchangeRate

    // Construct current invoice object for preview
    const currentInvoice: Invoice = {
        id: invoice?.id || 'preview',
        user_id: invoice?.user_id || 'preview',
        client_id: clientId,
        template_id: null,
        invoice_number: invoiceNumber,
        date: date,
        due_date: dueDate,
        line_items: lineItems,
        totals: totals,
        primary_currency: 'EUR',
        secondary_currency: secondaryCurrency || null,
        exchange_rate_used: exchangeRate,
        show_secondary_currency: showSecondaryCurrency,
        show_iva: showIva,
        show_payment_details: showPaymentDetails,
        payment_details: paymentDetails,
        show_notes: showNotes,
        notes: notes,
        status: invoice?.status || 'draft',
        submitted_to_accountant: submittedToAccountant,
        created_at: invoice?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: client,
    }

    // Submit
    async function action(formData: FormData) {
        const serviceItems = lineItems.filter(item => !item.is_expense)
        if (serviceItems.length === 0) {
            setLineItemsError('Add at least one line item before saving.')
            return
        }
        setLineItemsError('')
        setIsDirty(false)
        const rawData = {
            client_id: clientId,
            template_id: null,
            invoice_number: invoiceNumber,
            date: date,
            due_date: dueDate,
            line_items: lineItems,
            primary_currency: 'EUR',
            secondary_currency: secondaryCurrency || null,
            exchange_rate_used: exchangeRate,
            show_secondary_currency: showSecondaryCurrency,
            show_iva: showIva,
            show_payment_details: showPaymentDetails,
            payment_details: paymentDetails,
            show_notes: showNotes,
            notes: notes,
            submitted_to_accountant: submittedToAccountant,
            totals: totals,
        }

        if (isEditing && invoice) {
            await updateInvoiceAction(invoice.id, rawData)
        } else {
            await createInvoiceAction(rawData)
        }
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">
            {/* Left Column: Form (Scrollable) */}
            <div className="w-full lg:w-1/2 flex flex-col h-full overflow-y-auto pr-2 pb-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/app/invoices">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Invoice' : 'New Invoice'}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing && invoice && (
                            <Link href={`/app/invoices/${invoice.id}/send`}>
                                <Button type="button" variant="outline" size="sm">
                                    Send Invoice
                                </Button>
                            </Link>
                        )}
                        {client && (
                            <PDFDownloadButton
                                invoice={currentInvoice}
                                client={client}
                                settings={settings}
                                variant="outline"
                                size="sm"
                            />
                        )}
                        <Button type="submit" form="invoice-form" size="sm">
                            {isEditing ? 'Save' : 'Create'}
                        </Button>
                    </div>
                </div>

                {lineItemsError && (
                    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                        {lineItemsError}
                    </div>
                )}
                <form id="invoice-form" action={action} className="space-y-6" onChange={() => setIsDirty(true)}>
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="client">Client</Label>
                                    <Select
                                        id="client"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select a client...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="invoice_number">Invoice Number</Label>
                                    <Input
                                        id="invoice_number"
                                        value={invoiceNumber}
                                        onChange={(e) => {
                                            invoiceNumberEdited.current = true
                                            setInvoiceNumber(e.target.value)
                                        }}
                                        placeholder={clientId ? 'Generating...' : 'Select a client first'}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="due_date">Due Date</Label>
                                        {!invoice?.due_date && settings?.payment_terms && (
                                            <span className="text-xs text-neutral-400">{settings.payment_terms} days from today</span>
                                        )}
                                    </div>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold">Line Items</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {lineItems.filter(item => !item.is_expense).map((item, index) => {
                                    // Find original index
                                    const originalIndex = lineItems.indexOf(item)
                                    return (
                                        <div key={originalIndex} className="flex items-start space-x-2 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateLineItem(originalIndex, 'description', e.target.value)}
                                                    placeholder="Description"
                                                />
                                                <div className="flex space-x-2">
                                                    <div className="w-24">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.quantity}
                                                            onChange={(e) => updateLineItem(originalIndex, 'quantity', parseFloat(e.target.value))}
                                                            placeholder="Qty"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unit_price}
                                                            onChange={(e) => updateLineItem(originalIndex, 'unit_price', parseFloat(e.target.value))}
                                                            placeholder="Price"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex items-center justify-end font-mono text-sm text-neutral-500">
                                                        {formatCurrency(item.quantity * item.unit_price)}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(originalIndex)} className="mt-1">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold">Reimbursable Expenses (Suplidos)</h3>
                                <Button type="button" variant="outline" size="sm" onClick={() => setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, is_expense: true }])}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {lineItems.filter(item => item.is_expense).map((item, index) => {
                                    const originalIndex = lineItems.indexOf(item)
                                    return (
                                        <div key={originalIndex} className="flex items-start space-x-2 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateLineItem(originalIndex, 'description', e.target.value)}
                                                    placeholder="Description"
                                                />
                                                <div className="flex space-x-2">
                                                    <div className="w-24">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.quantity}
                                                            onChange={(e) => updateLineItem(originalIndex, 'quantity', parseFloat(e.target.value))}
                                                            placeholder="Qty"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unit_price}
                                                            onChange={(e) => updateLineItem(originalIndex, 'unit_price', parseFloat(e.target.value))}
                                                            placeholder="Price"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex items-center justify-end font-mono text-sm text-neutral-500">
                                                        {formatCurrency(item.quantity * item.unit_price)}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(originalIndex)} className="mt-1">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold">Settings & Totals</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="iva">IVA (%)</Label>
                                    <Input
                                        id="iva"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={ivaRate}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value)
                                            setIvaRate(isFinite(v) ? v : 0)
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="irpf" className={!showIrpf ? 'text-neutral-400' : ''}>IRPF (%)</Label>
                                        <input
                                            type="checkbox"
                                            checked={showIrpf}
                                            onChange={(e) => setShowIrpf(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                        />
                                    </div>
                                    <Input
                                        id="irpf"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={irpfRate}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value)
                                            setIrpfRate(isFinite(v) ? v : 0)
                                        }}
                                        disabled={!showIrpf}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="show_iva"
                                    checked={showIva}
                                    onChange={(e) => setShowIva(e.target.checked)}
                                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                />
                                <Label htmlFor="show_iva">Show IVA</Label>
                            </div>

                            <div className="pt-4 border-t border-neutral-100">
                                <div className="flex items-center space-x-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="show_secondary"
                                        checked={showSecondaryCurrency}
                                        onChange={(e) => setShowSecondaryCurrency(e.target.checked)}
                                        className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                    />
                                    <Label htmlFor="show_secondary">Show Secondary Currency</Label>
                                </div>

                                {showSecondaryCurrency && (
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="secondary_currency">Currency</Label>
                                            <Select
                                                id="secondary_currency"
                                                value={secondaryCurrency}
                                                onChange={(e) => setSecondaryCurrency(e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                {CURRENCIES.filter(c => c.code !== 'EUR').map(c => (
                                                    <option key={c.code} value={c.code}>{c.code}</option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="exchange_rate">Rate (EUR to {secondaryCurrency})</Label>
                                            <Input
                                                id="exchange_rate"
                                                type="number"
                                                step="0.0001"
                                                value={exchangeRate}
                                                onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="show_payment_details"
                                        checked={showPaymentDetails}
                                        onChange={(e) => setShowPaymentDetails(e.target.checked)}
                                        className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                    />
                                    <Label htmlFor="show_payment_details">Payment Details</Label>
                                </div>
                                {showPaymentDetails && (
                                    <Textarea
                                        placeholder="Bank Name, IBAN, SWIFT..."
                                        value={paymentDetails}
                                        onChange={(e) => setPaymentDetails(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="show_notes"
                                        checked={showNotes}
                                        onChange={(e) => setShowNotes(e.target.checked)}
                                        className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                    />
                                    <Label htmlFor="show_notes">Additional Notes</Label>
                                </div>
                                {showNotes && (
                                    <Textarea
                                        placeholder="Terms and conditions, thank you note..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="submitted_to_accountant"
                                    checked={submittedToAccountant}
                                    onChange={(e) => setSubmittedToAccountant(e.target.checked)}
                                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                />
                                <div>
                                    <Label htmlFor="submitted_to_accountant">Submitted to accountant</Label>
                                    <p className="text-xs text-neutral-500 mt-0.5">Mark when you have sent this invoice to your gestor</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </form>
            </div>

            {/* Right Column: Live Preview */}
            <div className="hidden lg:block w-full lg:w-1/2 h-full pb-4">
                {client ? (
                    <PdfPreview
                        invoice={currentInvoice}
                        client={client}
                        settings={settings}
                    />
                ) : (
                    <div className="h-full w-full bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-400">
                        Select a client to see preview
                    </div>
                )}
            </div>
        </div>
    )
}
