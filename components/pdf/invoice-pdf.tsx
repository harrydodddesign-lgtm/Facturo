import React from 'react'
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'
import { Invoice, Client, Settings } from '@/types'
import { formatCurrency } from '@/lib/currency'

// Register fonts
// Using standard Helvetica for now as it's built-in and safe.
// For "Apple-like", Helvetica is close enough to San Francisco in this context.

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#111111',
    },
    header: {
        marginBottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    label: {
        color: '#666666',
        fontSize: 8,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    value: {
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    col: {
        flexDirection: 'column',
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 5,
        marginBottom: 5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: '#EEEEEE',
    },
    descriptionCol: { width: '50%' },
    qtyCol: { width: '10%', textAlign: 'center' },
    priceCol: { width: '20%', textAlign: 'right' },
    totalCol: { width: '20%', textAlign: 'right' },

    totals: {
        marginTop: 20,
        alignSelf: 'flex-end',
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#111111',
        paddingTop: 5,
        marginTop: 5,
        fontWeight: 'bold',
        fontSize: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        fontSize: 8,
        color: '#666666',
        textAlign: 'center',
    },
    secondaryCurrencyBox: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#F9F9F9',
        borderRadius: 4,
    },
    notesBox: {
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderRadius: 4,
    },
    notesTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#666666',
    },
    notesText: {
        fontSize: 9,
        lineHeight: 1.4,
    }
})

interface InvoicePDFProps {
    invoice: Invoice
    client: Client
    settings: Settings | null
}

function safeCurrency(amount: number, currency: string = 'EUR'): string {
    if (!isFinite(amount)) return formatCurrency(0, currency)
    return formatCurrency(amount, currency)
}

export const InvoicePDF = ({ invoice, client, settings }: InvoicePDFProps) => {
    const subtotal = invoice.totals.subtotal || 0
    const rawIvaRate = subtotal > 0 ? (invoice.totals.iva / subtotal) * 100 : null
    const ivaRate = (rawIvaRate != null && isFinite(rawIvaRate)) ? rawIvaRate : (settings?.default_iva ?? 21)
    const rawIrpfRate = subtotal > 0 ? (invoice.totals.irpf / subtotal) * 100 : null
    const irpfRate = (rawIrpfRate != null && isFinite(rawIrpfRate)) ? rawIrpfRate : (settings?.default_irpf ?? 15)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.col}>
                        <Text style={styles.title}>INVOICE</Text>
                        <Text style={styles.value}>{invoice.invoice_number}</Text>
                    </View>
                    <View style={[styles.col, { alignItems: 'flex-end' }]}>
                        <Text style={styles.label}>DATE</Text>
                        <Text style={styles.value}>{new Date(invoice.date).toLocaleDateString('es-ES')}</Text>
                        <Text style={styles.label}>DUE DATE</Text>
                        <Text style={styles.value}>{new Date(invoice.due_date).toLocaleDateString('es-ES')}</Text>
                    </View>
                </View>

                {/* Client & User Details */}
                <View style={[styles.row, { marginBottom: 30 }]}>
                    <View style={[styles.col, { width: '48%' }]}>
                        <Text style={styles.label}>BILLED TO</Text>
                        <Text style={[styles.value, { fontWeight: 'bold' }]}>{client.name}</Text>
                        {client.address ? <Text style={styles.value}>{client.address}</Text> : null}
                        {client.nif ? <Text style={styles.value}>VAT: {client.nif}</Text> : null}
                        {client.email ? <Text style={styles.value}>{client.email}</Text> : null}
                        {!client.nif && client.contact ? <Text style={styles.value}>{client.contact}</Text> : null}
                    </View>
                    <View style={[styles.col, { width: '48%', alignItems: 'flex-end' }]}>
                        <Text style={styles.label}>FROM</Text>
                        {settings?.company_name ? (
                            <Text style={[styles.value, { fontWeight: 'bold' }]}>{settings.company_name}</Text>
                        ) : null}
                        {settings?.company_address ? (
                            <Text style={[styles.value, { textAlign: 'right' }]}>{settings.company_address}</Text>
                        ) : null}
                        {settings?.tax_id ? (
                            <Text style={styles.value}>Tax ID: {settings.tax_id}</Text>
                        ) : null}
                        {settings?.company_email ? (
                            <Text style={styles.value}>{settings.company_email}</Text>
                        ) : null}
                    </View>
                </View>

                {/* Line Items */}
                {/* Services */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.descriptionCol}>DESCRIPTION</Text>
                        <Text style={styles.qtyCol}>QTY</Text>
                        <Text style={styles.priceCol}>UNIT PRICE</Text>
                        <Text style={styles.totalCol}>AMOUNT</Text>
                    </View>
                    {invoice.line_items.filter(item => !item.is_expense).map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.descriptionCol}>{item.description}</Text>
                            <Text style={styles.qtyCol}>{item.quantity}</Text>
                            <Text style={styles.priceCol}>{safeCurrency(item.unit_price)}</Text>
                            <Text style={styles.totalCol}>{safeCurrency(item.quantity * item.unit_price)}</Text>
                        </View>
                    ))}
                </View>

                {/* Expenses */}
                {invoice.line_items.some(item => item.is_expense) && (
                    <View>
                        <Text style={[styles.label, { marginBottom: 5 }]}>REIMBURSABLE EXPENSES (SUPLIDOS)</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.descriptionCol}>DESCRIPTION</Text>
                                <Text style={styles.qtyCol}>QTY</Text>
                                <Text style={styles.priceCol}>UNIT PRICE</Text>
                                <Text style={styles.totalCol}>AMOUNT</Text>
                            </View>
                            {invoice.line_items.filter(item => item.is_expense).map((item, i) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={styles.descriptionCol}>{item.description}</Text>
                                    <Text style={styles.qtyCol}>{item.quantity}</Text>
                                    <Text style={styles.priceCol}>{safeCurrency(item.unit_price)}</Text>
                                    <Text style={styles.totalCol}>{safeCurrency(item.quantity * item.unit_price)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text>Subtotal</Text>
                        <Text>{safeCurrency(invoice.totals.subtotal)}</Text>
                    </View>
                    {invoice.show_iva ? (
                        <View style={styles.totalRow}>
                            <Text>IVA ({Math.round(ivaRate)}%)</Text>
                            <Text>{safeCurrency(invoice.totals.iva)}</Text>
                        </View>
                    ) : null}
                    {invoice.totals.irpf > 0 && (
                        <View style={styles.totalRow}>
                            <Text>IRPF ({Math.round(irpfRate)}%)</Text>
                            <Text>-{safeCurrency(invoice.totals.irpf)}</Text>
                        </View>
                    )}
                    {invoice.totals.expenses > 0 && (
                        <View style={styles.totalRow}>
                            <Text>Expenses</Text>
                            <Text>{safeCurrency(invoice.totals.expenses)}</Text>
                        </View>
                    )}
                    <View style={styles.grandTotal}>
                        <Text>TOTAL (EUR)</Text>
                        <Text>{safeCurrency(invoice.totals.total)}</Text>
                    </View>
                </View>

                {/* Secondary Currency */}
                {invoice.show_secondary_currency && invoice.secondary_currency && (
                    <View style={styles.secondaryCurrencyBox}>
                        <View style={styles.totalRow}>
                            <Text>Total in {invoice.secondary_currency}</Text>
                            <Text>{safeCurrency(invoice.totals.total * (invoice.exchange_rate_used || 1), invoice.secondary_currency)}</Text>
                        </View>
                        <Text style={{ fontSize: 8, color: '#666666', marginTop: 5 }}>
                            Exchange Rate: 1 EUR = {invoice.exchange_rate_used} {invoice.secondary_currency}
                        </Text>
                    </View>
                )}

                {/* Payment Details — manual or auto from settings */}
                {(() => {
                    const manualDetails = invoice.show_payment_details && invoice.payment_details
                    const settingsBankDetails = !manualDetails && settings && (settings.iban || settings.bank_name)
                        ? [
                            settings.bank_name && `Bank: ${settings.bank_name}`,
                            settings.iban && `IBAN: ${settings.iban}`,
                            settings.swift_bic && `SWIFT/BIC: ${settings.swift_bic}`,
                          ].filter(Boolean).join('\n')
                        : null
                    const details = manualDetails || settingsBankDetails
                    if (!details) return null
                    return (
                        <View style={styles.notesBox}>
                            <Text style={styles.notesTitle}>PAYMENT DETAILS</Text>
                            <Text style={styles.notesText}>{details}</Text>
                        </View>
                    )
                })()}

                {/* Additional Notes */}
                {invoice.show_notes && invoice.notes && (
                    <View style={styles.notesBox}>
                        <Text style={styles.notesTitle}>ADDITIONAL NOTES</Text>
                        <Text style={styles.notesText}>{invoice.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    {settings?.invoice_footer || 'Thank you for your business.'}
                </Text>
            </Page>
        </Document>
    )
}
