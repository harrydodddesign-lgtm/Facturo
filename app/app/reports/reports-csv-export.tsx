'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

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

export function ReportsCsvExport({ quarters }: { quarters: QuarterSummary[] }) {
    const handleExport = () => {
        const headers = [
            'Quarter',
            'Invoices',
            'Revenue (EUR)',
            'Expenses (EUR)',
            'IVA Collected (EUR)',
            'IRPF Withheld (EUR)',
            'Net Received (EUR)',
            'Est. Tax Owed (EUR)',
        ]

        const rows = quarters.map((q) => [
            q.label,
            q.invoiceCount,
            q.revenue.toFixed(2),
            q.expenses.toFixed(2),
            q.ivaCollected.toFixed(2),
            q.irpfWithheld.toFixed(2),
            q.netReceived.toFixed(2),
            q.estimatedTaxOwed.toFixed(2),
        ])

        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n')

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `facturo-report-${new Date().getFullYear()}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
    )
}
