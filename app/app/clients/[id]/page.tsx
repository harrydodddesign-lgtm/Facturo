import { getClient, getInvoicesByClient } from '@/lib/data'
import { ClientForm } from '../client-form'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'
import { getStatusColor } from '@/lib/dashboard-helpers'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [client, invoices] = await Promise.all([getClient(id), getInvoicesByClient(id)])

    if (!client) redirect('/app/clients')

    const now = new Date()
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.totals.total, 0)
    const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totals.total, 0)
    const outstanding = invoices
        .filter(inv => inv.status === 'sent' || inv.status === 'draft')
        .reduce((sum, inv) => sum + inv.totals.total, 0)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{client.name}</h1>
                <p className="text-neutral-500">Edit client details and view invoice history.</p>
            </div>

            {/* Summary stats */}
            {invoices.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-neutral-500">Total billed</p>
                            <p className="text-2xl font-bold text-neutral-900">{formatCurrency(totalBilled, 'EUR')}</p>
                            <p className="text-xs text-neutral-400 mt-1">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-neutral-500">Received</p>
                            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid, 'EUR')}</p>
                            <p className="text-xs text-neutral-400 mt-1">From paid invoices</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-neutral-500">Outstanding</p>
                            <p className={`text-2xl font-bold ${outstanding > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>
                                {formatCurrency(outstanding, 'EUR')}
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">Draft + sent invoices</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <ClientForm client={client} />

            {/* Invoice history */}
            <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Invoice History</h2>
                {invoices.length === 0 ? (
                    <div className="rounded-md border border-neutral-200 bg-white flex items-center justify-center h-24 text-neutral-400 text-sm">
                        No invoices for this client yet.
                    </div>
                ) : (
                    <div className="rounded-md border border-neutral-200 bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Number</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => {
                                    const isOverdue = invoice.status === 'sent' && new Date(invoice.due_date) < now
                                    const displayStatus = isOverdue ? 'overdue' : invoice.status
                                    const statusColors = getStatusColor(displayStatus)
                                    return (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/app/invoices/${invoice.id}`} className="hover:underline font-mono text-sm">
                                                    {invoice.invoice_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(invoice.totals.total, 'EUR')}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                                    {statusColors.label}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}
