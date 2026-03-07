import Link from 'next/link'
import { getInvoices, getSettings } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Copy } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { getStatusColor } from '@/lib/dashboard-helpers'
import { PDFDownloadButton } from '@/components/pdf-download-button'
import { DeleteButton } from '@/components/delete-button'
import { FormSubmitButton } from '@/components/form-submit-button'
import { updateInvoiceStatusAction, deleteInvoiceAction, toggleAccountantSubmittedAction, duplicateInvoiceAction } from '@/lib/actions'
import { InvoiceSearch } from './invoice-search'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'

const STATUS_TABS = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Paid', value: 'paid' },
]

export default async function InvoicesPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; q?: string }>
}) {
    const { status: statusFilter, q } = await searchParams
    const [invoices, settings] = await Promise.all([getInvoices(), getSettings()])
    const now = new Date()

    const withOverdue = invoices.map(inv => ({
        ...inv,
        _isOverdue: inv.status === 'sent' && new Date(inv.due_date) < now,
    }))

    // Status filter
    const byStatus = statusFilter === 'overdue'
        ? withOverdue.filter(inv => inv._isOverdue)
        : statusFilter
            ? withOverdue.filter(inv => inv.status === statusFilter && !inv._isOverdue)
            : withOverdue

    // Text search across invoice number and client name
    const filtered = q
        ? byStatus.filter(inv =>
            inv.invoice_number.toLowerCase().includes(q.toLowerCase()) ||
            (inv.client?.name ?? '').toLowerCase().includes(q.toLowerCase())
        )
        : byStatus

    const counts = {
        '': invoices.length,
        draft: invoices.filter(i => i.status === 'draft').length,
        sent: invoices.filter(i => i.status === 'sent' && new Date(i.due_date) >= now).length,
        overdue: invoices.filter(i => i.status === 'sent' && new Date(i.due_date) < now).length,
        paid: invoices.filter(i => i.status === 'paid').length,
    } as Record<string, number>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Invoices</h1>
                    <p className="text-neutral-500">Manage and track your invoices.</p>
                </div>
                <Link href="/app/invoices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Invoice
                    </Button>
                </Link>
            </div>

            {/* Status filter tabs + search */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex gap-1 border-b border-neutral-200 flex-1">
                    {STATUS_TABS.map(tab => {
                        const active = (statusFilter ?? '') === tab.value
                        const count = counts[tab.value]
                        return (
                            <Link
                                key={tab.value}
                                href={tab.value ? `/app/invoices?status=${tab.value}` : '/app/invoices'}
                                className={cn(
                                    'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                                    active
                                        ? 'border-neutral-900 text-neutral-900'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                )}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className={cn(
                                        'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                                        active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600',
                                        tab.value === 'overdue' && !active && count > 0 && 'bg-red-100 text-red-700'
                                    )}>
                                        {count}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
                <Suspense>
                    <InvoiceSearch defaultValue={q} />
                </Suspense>
            </div>

            <div className="rounded-md border border-neutral-200 bg-white overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Number</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead className="hidden sm:table-cell">Date</TableHead>
                            <TableHead className="hidden md:table-cell">Due</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center hidden lg:table-cell">Acct.</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-neutral-500">
                                    {q ? `No invoices matching "${q}".` : statusFilter ? `No ${statusFilter} invoices.` : 'No invoices yet. Create one to get started.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((invoice) => {
                                const displayStatus = invoice._isOverdue ? 'overdue' : invoice.status
                                const statusColors = getStatusColor(displayStatus)
                                return (
                                    <TableRow key={invoice.id}>
                                        <TableCell>
                                            <Link href={`/app/invoices/${invoice.id}`} className="font-mono font-medium hover:underline">
                                                {invoice.invoice_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="max-w-[120px] truncate">{invoice.client?.name}</TableCell>
                                        <TableCell className="text-neutral-500 hidden sm:table-cell">
                                            {new Date(invoice.date).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell className={cn(
                                            'hidden md:table-cell text-neutral-500',
                                            invoice._isOverdue && 'text-red-600 font-medium'
                                        )}>
                                            {new Date(invoice.due_date).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium">
                                            {formatCurrency(invoice.totals.total, 'EUR')}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                                {statusColors.label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center hidden lg:table-cell">
                                            <form action={toggleAccountantSubmittedAction.bind(null, invoice.id, !invoice.submitted_to_accountant)}>
                                                <button
                                                    type="submit"
                                                    title={invoice.submitted_to_accountant ? 'Submitted — click to undo' : 'Mark as submitted to accountant'}
                                                    className={`w-4 h-4 rounded border-2 transition-colors ${invoice.submitted_to_accountant ? 'bg-neutral-800 border-neutral-800' : 'border-neutral-300 hover:border-neutral-500'}`}
                                                >
                                                    {invoice.submitted_to_accountant && (
                                                        <span className="block text-white text-[10px] leading-none text-center">✓</span>
                                                    )}
                                                </button>
                                            </form>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {invoice.status === 'draft' && (
                                                    <form action={updateInvoiceStatusAction.bind(null, invoice.id, 'sent')}>
                                                        <FormSubmitButton className="h-7 text-xs px-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50" pendingText="…">
                                                            Mark Sent
                                                        </FormSubmitButton>
                                                    </form>
                                                )}
                                                {(invoice.status === 'sent' || invoice._isOverdue) && (
                                                    <form action={updateInvoiceStatusAction.bind(null, invoice.id, 'paid')}>
                                                        <FormSubmitButton className="h-7 text-xs px-2 text-green-700 hover:text-green-800 hover:bg-green-50" pendingText="…">
                                                            Mark Paid
                                                        </FormSubmitButton>
                                                    </form>
                                                )}
                                                {invoice.status !== 'paid' && (
                                                    <Link href={`/app/invoices/${invoice.id}/send`} title="Send by email">
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                                                            Send
                                                        </Button>
                                                    </Link>
                                                )}
                                                {invoice.client && (
                                                    <PDFDownloadButton
                                                        invoice={invoice}
                                                        client={invoice.client}
                                                        settings={settings}
                                                        variant="ghost"
                                                        size="sm"
                                                        showText={false}
                                                    />
                                                )}
                                                <form action={duplicateInvoiceAction.bind(null, invoice.id)}>
                                                    <FormSubmitButton className="h-7 text-xs px-2 text-neutral-500 hover:text-neutral-700" pendingText="…">
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </FormSubmitButton>
                                                </form>
                                                <DeleteButton
                                                    deleteAction={deleteInvoiceAction.bind(null, invoice.id)}
                                                    label="Delete"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
