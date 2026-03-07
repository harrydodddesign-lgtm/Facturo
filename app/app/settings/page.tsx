import { getSettings } from '@/lib/data'
import { updateSettingsAction } from '@/lib/actions'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Settings</h1>
                <p className="text-neutral-500">Manage your invoicing preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                        <CardDescription>Your business details that appear on invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            'use server'
                            await updateSettingsAction({
                                company_name: formData.get('company_name') as string || null,
                                company_address: formData.get('company_address') as string || null,
                                tax_id: formData.get('tax_id') as string || null,
                                company_email: formData.get('company_email') as string || null,
                                company_phone: formData.get('company_phone') as string || null,
                            })
                            redirect('/app/settings?success=1')
                        }} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                    id="company_name"
                                    name="company_name"
                                    placeholder="Your Company Ltd."
                                    defaultValue={settings?.company_name || ''}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="company_address">Address</Label>
                                <Input
                                    id="company_address"
                                    name="company_address"
                                    placeholder="123 Business Street, City, Country"
                                    defaultValue={settings?.company_address || ''}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="tax_id">Tax ID / NIF</Label>
                                    <Input
                                        id="tax_id"
                                        name="tax_id"
                                        placeholder="ESB12345678"
                                        defaultValue={settings?.tax_id || ''}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="company_email">Email</Label>
                                    <Input
                                        id="company_email"
                                        name="company_email"
                                        type="email"
                                        placeholder="contact@company.com"
                                        defaultValue={settings?.company_email || ''}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="company_phone">Phone</Label>
                                <Input
                                    id="company_phone"
                                    name="company_phone"
                                    placeholder="+34 123 456 789"
                                    defaultValue={settings?.company_phone || ''}
                                />
                            </div>
                            <Button type="submit">Save Company Info</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Settings</CardTitle>
                        <CardDescription>Configure default values for your invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            'use server'
                            const rawFormData = {
                                invoice_prefix: formData.get('invoice_prefix') as string,
                                default_iva: Number(formData.get('default_iva')),
                                default_irpf: Number(formData.get('default_irpf')),
                                accountant_mode: formData.get('accountant_mode') === 'on',
                            }
                            await updateSettingsAction(rawFormData)
                            redirect('/app/settings?success=1')
                        }} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                                <Input
                                    id="invoice_prefix"
                                    name="invoice_prefix"
                                    defaultValue={settings?.invoice_prefix || 'INV'}
                                    placeholder="INV"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="default_iva">Default IVA (%)</Label>
                                    <Input
                                        id="default_iva"
                                        name="default_iva"
                                        type="number"
                                        step="0.1"
                                        defaultValue={settings?.default_iva ?? 21}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="default_irpf">Default IRPF (%)</Label>
                                    <Input
                                        id="default_irpf"
                                        name="default_irpf"
                                        type="number"
                                        step="0.1"
                                        defaultValue={settings?.default_irpf ?? 15}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="accountant_mode"
                                    name="accountant_mode"
                                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                    defaultChecked={settings?.accountant_mode}
                                />
                                <Label htmlFor="accountant_mode">Accountant Mode (Hide secondary currency on exports)</Label>
                            </div>
                            <Button type="submit">Save Invoice Settings</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Banking & Payment Details</CardTitle>
                        <CardDescription>Payment information displayed on invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            'use server'
                            await updateSettingsAction({
                                bank_name: formData.get('bank_name') as string || null,
                                iban: formData.get('iban') as string || null,
                                swift_bic: formData.get('swift_bic') as string || null,
                                payment_terms: formData.get('payment_terms') ? Number(formData.get('payment_terms')) : null,
                                invoice_footer: formData.get('invoice_footer') as string || null,
                            })
                            redirect('/app/settings?success=1')
                        }} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="bank_name">Bank Name</Label>
                                <Input
                                    id="bank_name"
                                    name="bank_name"
                                    placeholder="Bank Name"
                                    defaultValue={settings?.bank_name || ''}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="iban">IBAN</Label>
                                <Input
                                    id="iban"
                                    name="iban"
                                    placeholder="ES00 0000 0000 0000 0000 0000"
                                    defaultValue={settings?.iban || ''}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="swift_bic">SWIFT/BIC (Optional)</Label>
                                <Input
                                    id="swift_bic"
                                    name="swift_bic"
                                    placeholder="BANKESMMXXX"
                                    defaultValue={settings?.swift_bic || ''}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="payment_terms">Default Payment Terms (Days)</Label>
                                <Input
                                    id="payment_terms"
                                    name="payment_terms"
                                    type="number"
                                    placeholder="30"
                                    defaultValue={settings?.payment_terms ?? 30}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="invoice_footer">Invoice Footer Notes</Label>
                                <Input
                                    id="invoice_footer"
                                    name="invoice_footer"
                                    placeholder="Thank you for your business!"
                                    defaultValue={settings?.invoice_footer || ''}
                                />
                            </div>
                            <Button type="submit">Save Payment Details</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="opacity-60">
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Email notifications — coming soon.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}
