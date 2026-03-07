import Link from 'next/link'
import { getInvoices, getSettings, getClients } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Users, TrendingUp, FileText, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import {
    calculateMonthlyRevenue,
    calculateTotalEarnings,
    getInvoicesByStatus,
    getOverdueInvoices,
    getStatusColor
} from '@/lib/dashboard-helpers'
import { PDFDownloadButton } from '@/components/pdf-download-button'

export default async function DashboardPage() {
    const [invoices, settings, clients] = await Promise.all([getInvoices(), getSettings(), getClients()])

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const totalEarnings = calculateTotalEarnings(invoices)
    const thisMonthRevenue = calculateMonthlyRevenue(invoices, currentMonth, currentYear)
    const lastMonthRevenue = calculateMonthlyRevenue(invoices, lastMonth, lastMonthYear)
    const revenueChange = lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0

    const paidInvoices = getInvoicesByStatus(invoices, 'paid')
    const sentInvoices = getInvoicesByStatus(invoices, 'sent')
    const overdueInvoices = getOverdueInvoices(invoices)

    const pendingValue = sentInvoices.reduce((s, inv) => s + inv.totals.total, 0)
    const overdueValue = overdueInvoices.reduce((s, inv) => s + inv.totals.total, 0)

    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

    // Setup checklist
    const setupSteps = [
        { label: 'Add your company info', done: !!settings?.company_name, href: '/app/settings' },
        { label: 'Add banking details', done: !!settings?.iban, href: '/app/settings' },
        { label: 'Add your first client', done: clients.length > 0, href: '/app/clients/new' },
        { label: 'Create your first invoice', done: invoices.length > 0, href: '/app/invoices/new' },
    ]
    const setupComplete = setupSteps.every(s => s.done)
    const setupProgress = setupSteps.filter(s => s.done).length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
                    <p className="text-neutral-500">Overview of your invoicing activity</p>
                </div>
                <div className="flex space-x-2">
                    <Link href="/app/clients/new">
                        <Button variant="outline">
                            <Users className="mr-2 h-4 w-4" />
                            Add Client
                        </Button>
                    </Link>
                    <Link href="/app/invoices/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Setup checklist */}
            {!setupComplete && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="font-medium text-neutral-900 mb-3">
                                    Get started — {setupProgress}/{setupSteps.length} steps complete
                                </p>
                                <div className="w-full bg-neutral-200 rounded-full h-1 mb-4">
                                    <div
                                        className="bg-neutral-800 h-1 rounded-full transition-all"
                                        style={{ width: `${(setupProgress / setupSteps.length) * 100}%` }}
                                    />
                                </div>
                                <ul className="space-y-2">
                                    {setupSteps.map(step => (
                                        <li key={step.label} className="flex items-center gap-3 text-sm">
                                            {step.done ? (
                                                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border-2 border-neutral-300 shrink-0" />
                                            )}
                                            {step.done ? (
                                                <span className="text-neutral-400 line-through">{step.label}</span>
                                            ) : (
                                                <Link href={step.href} className="text-neutral-700 hover:text-neutral-900 hover:underline flex items-center gap-1">
                                                    {step.label}
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Revenue Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <TrendingUp className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalEarnings, 'EUR')}</div>
                        <p className="text-xs text-neutral-500">All-time from paid invoices</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(thisMonthRevenue, 'EUR')}</div>
                        {lastMonthRevenue > 0 && (
                            <p className={`text-xs ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% vs last month
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(lastMonthRevenue, 'EUR')}</div>
                        <p className="text-xs text-neutral-500">
                            {new Date(lastMonthYear, lastMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice status cards — show amounts, not just counts */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoices.length}</div>
                        <p className="text-xs text-neutral-500">{paidInvoices.length} paid</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(totalEarnings, 'EUR')}</div>
                        <p className="text-xs text-neutral-500">{paidInvoices.length} invoice{paidInvoices.length !== 1 ? 's' : ''}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{formatCurrency(pendingValue, 'EUR')}</div>
                        <p className="text-xs text-neutral-500">{sentInvoices.length} sent, awaiting payment</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${overdueInvoices.length > 0 ? 'text-red-700' : 'text-neutral-400'}`}>
                            {formatCurrency(overdueValue, 'EUR')}
                        </div>
                        <p className="text-xs text-neutral-500">{overdueInvoices.length} past due</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent invoices */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Recent Invoices</CardTitle>
                        <Link href="/app/invoices">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-neutral-200">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Number</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentInvoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-neutral-500">
                                            No invoices yet. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentInvoices.map((invoice) => {
                                        const isOverdue = invoice.status === 'sent' && new Date(invoice.due_date) < now
                                        const displayStatus = isOverdue ? 'overdue' : invoice.status
                                        const statusColors = getStatusColor(displayStatus)
                                        return (
                                            <TableRow key={invoice.id}>
                                                <TableCell>
                                                    <Link href={`/app/invoices/${invoice.id}`} className="font-mono font-medium hover:underline">
                                                        {invoice.invoice_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{invoice.client?.name}</TableCell>
                                                <TableCell className="text-neutral-500">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right font-mono font-medium">
                                                    {formatCurrency(invoice.totals.total, 'EUR')}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                                        {statusColors.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
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
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
