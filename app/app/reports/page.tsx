import { getInvoices } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'
import { ReportsCsvExport } from './reports-csv-export'
import { TrendingUp, Receipt, PiggyBank, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface QuarterSummary {
    year: number
    quarter: number
    label: string
    shortLabel: string
    invoiceCount: number
    revenue: number
    expenses: number
    ivaCollected: number
    irpfWithheld: number
    netReceived: number
    estimatedTaxOwed: number
}

function getQuarter(date: Date): { year: number; quarter: number } {
    return {
        year: date.getFullYear(),
        quarter: Math.floor(date.getMonth() / 3) + 1,
    }
}

const QUARTER_LABELS = ['Q1 Jan–Mar', 'Q2 Apr–Jun', 'Q3 Jul–Sep', 'Q4 Oct–Dec']
const QUARTER_SHORT = ['Q1', 'Q2', 'Q3', 'Q4']

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string }>
}) {
    const { year: yearParam } = await searchParams
    const invoices = await getInvoices()
    const paidInvoices = invoices.filter(inv => inv.status === 'paid')

    const quarterMap = new Map<string, QuarterSummary>()

    for (const invoice of paidInvoices) {
        const { year, quarter } = getQuarter(new Date(invoice.date))
        const key = `${year}-Q${quarter}`

        if (!quarterMap.has(key)) {
            quarterMap.set(key, {
                year,
                quarter,
                label: `${year} ${QUARTER_LABELS[quarter - 1]}`,
                shortLabel: `${QUARTER_SHORT[quarter - 1]} ${year}`,
                invoiceCount: 0,
                revenue: 0,
                expenses: 0,
                ivaCollected: 0,
                irpfWithheld: 0,
                netReceived: 0,
                estimatedTaxOwed: 0,
            })
        }

        const q = quarterMap.get(key)!
        q.invoiceCount += 1
        q.revenue += invoice.totals.subtotal
        q.expenses += invoice.totals.expenses || 0
        q.ivaCollected += invoice.totals.iva
        q.irpfWithheld += invoice.totals.irpf
    }

    for (const q of quarterMap.values()) {
        // Net received = what the client actually paid you (revenue + IVA - IRPF withheld)
        q.netReceived = q.revenue - q.irpfWithheld
        // Estimated quarterly tax = 20% of revenue minus IRPF already withheld
        q.estimatedTaxOwed = Math.max(0, q.revenue * 0.2 - q.irpfWithheld)
    }

    const quarters = Array.from(quarterMap.values()).sort((a, b) =>
        b.year !== a.year ? b.year - a.year : b.quarter - a.quarter
    )

    // Annual totals for the selected year
    const years = [...new Set(quarters.map(q => q.year))].sort((a, b) => b - a)
    const selectedYear = yearParam ? parseInt(yearParam) : (years[0] ?? new Date().getFullYear())
    const yearQuarters = quarters.filter(q => q.year === selectedYear)

    const annual = yearQuarters.reduce(
        (acc, q) => ({
            revenue: acc.revenue + q.revenue,
            expenses: acc.expenses + q.expenses,
            ivaCollected: acc.ivaCollected + q.ivaCollected,
            irpfWithheld: acc.irpfWithheld + q.irpfWithheld,
            netReceived: acc.netReceived + q.netReceived,
            estimatedTaxOwed: acc.estimatedTaxOwed + q.estimatedTaxOwed,
        }),
        { revenue: 0, expenses: 0, ivaCollected: 0, irpfWithheld: 0, netReceived: 0, estimatedTaxOwed: 0 }
    )

    // Bar chart: revenue per quarter this year (max for scaling)
    const maxRevenue = Math.max(...yearQuarters.map(q => q.revenue), 1)

    if (paidInvoices.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Reports</h1>
                    <p className="text-neutral-500">Financial summary from your paid invoices.</p>
                </div>
                <Card>
                    <CardContent className="flex items-center justify-center h-40 text-neutral-400">
                        No paid invoices yet — mark invoices as paid to see your reports.
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Reports</h1>
                    <p className="text-neutral-500">Financial summary from paid invoices.</p>
                </div>
                <div className="flex items-center gap-3">
                    {years.length > 1 && (
                        <div className="flex gap-1 rounded-md border border-neutral-200 p-0.5 bg-neutral-50">
                            {years.map(y => (
                                <Link
                                    key={y}
                                    href={`/app/reports?year=${y}`}
                                    className={cn(
                                        'px-3 py-1 rounded text-sm font-medium transition-colors',
                                        y === selectedYear
                                            ? 'bg-white text-neutral-900 shadow-sm'
                                            : 'text-neutral-500 hover:text-neutral-700'
                                    )}
                                >
                                    {y}
                                </Link>
                            ))}
                        </div>
                    )}
                    <ReportsCsvExport quarters={yearQuarters} />
                </div>
            </div>

            {/* Annual summary */}
            <div>
                <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">{selectedYear} at a glance</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-neutral-500">Revenue</span>
                                <TrendingUp className="h-4 w-4 text-neutral-400" />
                            </div>
                            <div className="text-2xl font-bold text-neutral-900">{formatCurrency(annual.revenue, 'EUR')}</div>
                            <p className="text-xs text-neutral-400 mt-1">Before taxes & retention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-neutral-500">Net Received</span>
                                <PiggyBank className="h-4 w-4 text-neutral-400" />
                            </div>
                            <div className="text-2xl font-bold text-green-700">{formatCurrency(annual.netReceived, 'EUR')}</div>
                            <p className="text-xs text-neutral-400 mt-1">Revenue minus IRPF withheld</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-neutral-500">IVA Collected</span>
                                <Receipt className="h-4 w-4 text-neutral-400" />
                            </div>
                            <div className="text-2xl font-bold text-blue-700">{formatCurrency(annual.ivaCollected, 'EUR')}</div>
                            <p className="text-xs text-neutral-400 mt-1">Owed to Hacienda (Mod. 303)</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-neutral-500">Est. Tax Owed</span>
                                <AlertCircle className="h-4 w-4 text-neutral-400" />
                            </div>
                            <div className="text-2xl font-bold text-amber-700">{formatCurrency(annual.estimatedTaxOwed, 'EUR')}</div>
                            <p className="text-xs text-neutral-400 mt-1">After IRPF withheld (Mod. 130)</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Revenue bar chart */}
            {yearQuarters.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Revenue by quarter — {selectedYear}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-4 h-32">
                            {yearQuarters.slice().reverse().map((q) => (
                                <div key={q.label} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-xs text-neutral-500 font-mono">{formatCurrency(q.revenue, 'EUR')}</span>
                                    <div className="w-full bg-neutral-100 rounded-t-sm relative" style={{ height: '72px' }}>
                                        <div
                                            className="absolute bottom-0 w-full bg-neutral-800 rounded-t-sm transition-all"
                                            style={{ height: `${Math.round((q.revenue / maxRevenue) * 72)}px` }}
                                        />
                                    </div>
                                    <span className="text-xs text-neutral-500">{q.shortLabel}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quarterly breakdown */}
            <div>
                <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">Quarterly breakdown</h2>
                <div className="rounded-md border border-neutral-200 bg-white overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50">
                                <th className="text-left px-4 py-3 font-medium text-neutral-600">Quarter</th>
                                <th className="text-right px-4 py-3 font-medium text-neutral-600">Revenue</th>
                                {annual.expenses > 0 && (
                                    <th className="text-right px-4 py-3 font-medium text-neutral-600">Expenses</th>
                                )}
                                <th className="text-right px-4 py-3 font-medium text-neutral-600">IVA</th>
                                {annual.irpfWithheld > 0 && (
                                    <th className="text-right px-4 py-3 font-medium text-neutral-600">IRPF Withheld</th>
                                )}
                                <th className="text-right px-4 py-3 font-medium text-neutral-600">Net Received</th>
                                <th className="text-right px-4 py-3 font-medium text-neutral-600">Est. Tax</th>
                                <th className="text-right px-4 py-3 font-medium text-neutral-600">Invoices</th>
                            </tr>
                        </thead>
                        <tbody>
                            {yearQuarters.map((q, i) => (
                                <tr key={q.label} className={`border-b border-neutral-100 ${i % 2 === 0 ? '' : 'bg-neutral-50/50'}`}>
                                    <td className="px-4 py-3 font-medium text-neutral-900">{q.label}</td>
                                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(q.revenue, 'EUR')}</td>
                                    {annual.expenses > 0 && (
                                        <td className="px-4 py-3 text-right font-mono text-neutral-500">{formatCurrency(q.expenses, 'EUR')}</td>
                                    )}
                                    <td className="px-4 py-3 text-right font-mono text-blue-700">{formatCurrency(q.ivaCollected, 'EUR')}</td>
                                    {annual.irpfWithheld > 0 && (
                                        <td className="px-4 py-3 text-right font-mono text-neutral-500">{formatCurrency(q.irpfWithheld, 'EUR')}</td>
                                    )}
                                    <td className="px-4 py-3 text-right font-mono font-semibold text-green-700">{formatCurrency(q.netReceived, 'EUR')}</td>
                                    <td className="px-4 py-3 text-right font-mono text-amber-700">{formatCurrency(q.estimatedTaxOwed, 'EUR')}</td>
                                    <td className="px-4 py-3 text-right text-neutral-500">{q.invoiceCount}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-neutral-200 bg-neutral-50 font-semibold">
                                <td className="px-4 py-3 text-neutral-900">Total {selectedYear}</td>
                                <td className="px-4 py-3 text-right font-mono">{formatCurrency(annual.revenue, 'EUR')}</td>
                                {annual.expenses > 0 && (
                                    <td className="px-4 py-3 text-right font-mono text-neutral-500">{formatCurrency(annual.expenses, 'EUR')}</td>
                                )}
                                <td className="px-4 py-3 text-right font-mono text-blue-700">{formatCurrency(annual.ivaCollected, 'EUR')}</td>
                                {annual.irpfWithheld > 0 && (
                                    <td className="px-4 py-3 text-right font-mono text-neutral-500">{formatCurrency(annual.irpfWithheld, 'EUR')}</td>
                                )}
                                <td className="px-4 py-3 text-right font-mono text-green-700">{formatCurrency(annual.netReceived, 'EUR')}</td>
                                <td className="px-4 py-3 text-right font-mono text-amber-700">{formatCurrency(annual.estimatedTaxOwed, 'EUR')}</td>
                                <td className="px-4 py-3 text-right text-neutral-500">{yearQuarters.reduce((s, q) => s + q.invoiceCount, 0)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <p className="text-xs text-neutral-400">
                Net received = revenue minus IRPF withheld at source by clients. Est. tax = 20% of revenue minus IRPF already withheld (Modelo 130 pago fraccionado). IVA and IRPF columns only appear when relevant. Consult your gestor for official filings.
            </p>
        </div>
    )
}
