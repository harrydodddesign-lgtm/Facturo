import { getInvoice, getSettings } from '@/lib/data'
import { sendInvoiceEmail } from '@/lib/email'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SendInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [invoice, settings] = await Promise.all([getInvoice(id), getSettings()])

    if (!invoice) redirect('/app/invoices')

    const client = invoice.client
    const defaultTo = client?.email || ''
    const defaultSubject = `Invoice ${invoice.invoice_number}`

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/app/invoices/${id}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Send Invoice</h1>
                    <p className="text-neutral-500">Email {invoice.invoice_number} to your client.</p>
                </div>
            </div>

            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Compose Email</CardTitle>
                    <CardDescription>
                        The invoice PDF will be attached automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        action={async (formData) => {
                            'use server'
                            const to = formData.get('to') as string
                            const subject = formData.get('subject') as string
                            const message = formData.get('message') as string

                            if (!invoice.client) throw new Error('Invoice has no client')

                            await sendInvoiceEmail({
                                invoice,
                                client: invoice.client,
                                settings,
                                to,
                                subject,
                                message,
                            })

                            redirect(`/app/invoices/${id}?success=1`)
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="to">To</Label>
                            <Input
                                id="to"
                                name="to"
                                type="email"
                                required
                                defaultValue={defaultTo}
                                placeholder="client@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                name="subject"
                                required
                                defaultValue={defaultSubject}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message (optional)</Label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                placeholder="Hi, please find your invoice attached..."
                                className="flex w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
                            />
                        </div>

                        {!process.env.RESEND_API_KEY && (
                            <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                                <strong>Note:</strong> Add <code>RESEND_API_KEY</code> to your <code>.env.local</code> to enable email sending.
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button type="submit">Send Invoice</Button>
                            <Link href={`/app/invoices/${id}`}>
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
