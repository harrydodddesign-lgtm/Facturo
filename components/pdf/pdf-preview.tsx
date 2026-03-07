'use client'

import dynamic from 'next/dynamic'
import { Invoice, Client, Settings } from '@/types'
import { InvoicePDF } from './invoice-pdf'
import { Component, ReactNode } from 'react'

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

class PdfErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStateFromError() {
        return { hasError: true }
    }
    componentDidUpdate(prevProps: { children: ReactNode }) {
        // Reset error when props change so the preview retries
        if (prevProps.children !== this.props.children && this.state.hasError) {
            this.setState({ hasError: false })
        }
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-full bg-neutral-100 text-neutral-400 text-sm">
                    Preview unavailable — fill in invoice details to see it here.
                </div>
            )
        }
        return this.props.children
    }
}

export function PdfPreview({ invoice, client, settings }: PdfPreviewProps) {
    return (
        <div className="h-full w-full bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden">
            <PdfErrorBoundary>
                <PDFViewer width="100%" height="100%" showToolbar={false} style={{ backgroundColor: 'white' }}>
                    <InvoicePDF invoice={invoice} client={client} settings={settings} />
                </PDFViewer>
            </PdfErrorBoundary>
        </div>
    )
}
