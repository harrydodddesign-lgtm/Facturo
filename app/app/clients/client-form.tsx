'use client'

import { Client } from '@/types'
import { createClientAction, updateClientAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { CURRENCIES } from '@/lib/currency'
import { Card, CardContent } from '@/components/ui/card'

export function ClientForm({ client }: { client?: Client }) {
    const isEditing = !!client

    async function action(formData: FormData) {
        const rawData = {
            name: formData.get('name') as string,
            client_code: formData.get('client_code') as string,
            contact: formData.get('contact') as string,
            address: formData.get('address') as string,
            preferred_currency: formData.get('preferred_currency') as string,
            notes: formData.get('notes') as string,
            nif: formData.get('nif') as string || null,
            email: formData.get('email') as string || null,
        }

        if (isEditing && client) {
            await updateClientAction(client.id, rawData)
        } else {
            await createClientAction(rawData)
        }
    }

    return (
        <form action={action}>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Client Name</Label>
                            <Input id="name" name="name" defaultValue={client?.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client_code">Client Code</Label>
                            <Input id="client_code" name="client_code" placeholder="e.g. ACME" defaultValue={client?.client_code} required />
                            <p className="text-xs text-neutral-400">Used to number invoices — e.g. ACME-2026-001</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nif">VAT / Tax Number</Label>
                            <Input
                                id="nif"
                                name="nif"
                                placeholder="e.g. BE0735795577 or ESB12345678"
                                defaultValue={client?.nif || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="contact@client.com"
                                defaultValue={client?.email || ''}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact">Contact Person</Label>
                        <Input id="contact" name="contact" defaultValue={client?.contact || ''} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" name="address" defaultValue={client?.address || ''} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="preferred_currency">Preferred Currency</Label>
                        <Select id="preferred_currency" name="preferred_currency" defaultValue={client?.preferred_currency || 'EUR'}>
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code} - {c.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" defaultValue={client?.notes || ''} />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit">{isEditing ? 'Save Changes' : 'Create Client'}</Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
