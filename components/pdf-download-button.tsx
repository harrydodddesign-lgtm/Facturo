'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { InvoicePDF } from '@/components/pdf/invoice-pdf'
import { Invoice, Client, Settings } from '@/types'

const PDFDownloadLinkWrapper = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <Button variant="outline" disabled><Download className="mr-2 h-4 w-4" />Loading...</Button>,
    }
)

interface PDFDownloadButtonProps {
    invoice: Invoice
    client: Client
    settings: Settings | null
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    showText?: boolean
    className?: string
}

export function PDFDownloadButton({
    invoice,
    client,
    settings,
    variant = 'outline',
    size = 'default',
    showText = true,
    className = ''
}: PDFDownloadButtonProps) {
    return (
        <PDFDownloadLinkWrapper
            document={
                <InvoicePDF
                    invoice={invoice}
                    client={client}
                    settings={settings}
                />
            }
            fileName={`${invoice.invoice_number}.pdf`}
        >
            {({ loading }) => (
                <Button
                    type="button"
                    variant={variant}
                    size={size}
                    disabled={loading}
                    className={className}
                >
                    <Download className={showText ? "mr-2 h-4 w-4" : "h-4 w-4"} />
                    {showText && (loading ? 'Generating...' : 'Download PDF')}
                </Button>
            )}
        </PDFDownloadLinkWrapper>
    )
}
