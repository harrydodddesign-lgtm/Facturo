'use client'

import dynamic from 'next/dynamic'
import { Invoice, Client, Settings } from '@/types'
import { InvoicePDF } from './invoice-pdf'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex items-center justify-center h-full bg-neutral-100 text-neutral-500">Loading Preview...</div>,
    }
)

interface PdfPreviewProps {
    invoice: Invoice
    client: Client
    settings: Settings | null
}

export function PdfPreview({ invoice, client, settings }: PdfPreviewProps) {
    const [scale, setScale] = useState(1)

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2))
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5))

    return (
        <div className="h-full w-full flex flex-col gap-4">
            <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4 mr-2" /> Zoom Out
                </Button>
                <div className="flex items-center px-2 text-sm text-neutral-500">
                    {(scale * 100).toFixed(0)}%
                </div>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4 mr-2" /> Zoom In
                </Button>
            </div>
            <div className="flex-1 bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden relative">
                <div
                    className="w-full h-full origin-top-left transition-transform duration-200"
                    style={{
                        transform: `scale(${scale})`,
                        width: `${100 / scale}%`,
                        height: `${100 / scale}%`
                    }}
                >
                    <PDFViewer width="100%" height="100%" className="bg-white shadow-lg" showToolbar={false} style={{ backgroundColor: 'white' }}>
                        <InvoicePDF invoice={invoice} client={client} settings={settings} />
                    </PDFViewer>
                </div>
            </div>
        </div>
    )
}
