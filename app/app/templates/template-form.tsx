'use client'

import { Template } from '@/types'
import { createTemplateAction, updateTemplateAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

export function TemplateForm({ template }: { template?: Template }) {
    const isEditing = !!template

    async function action(formData: FormData) {
        const rawData = {
            name: formData.get('name') as string,
            layout: formData.get('layout') as 'minimal' | 'detailed',
            fields: {
                showIVA: formData.get('showIVA') === 'on',
                showIRPF: formData.get('showIRPF') === 'on',
                showFooterNotes: formData.get('showFooterNotes') === 'on',
                showSecondaryCurrency: formData.get('showSecondaryCurrency') === 'on',
            }
        }

        if (isEditing && template) {
            await updateTemplateAction(template.id, rawData)
        } else {
            await createTemplateAction(rawData)
        }
    }

    return (
        <form action={action}>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input id="name" name="name" defaultValue={template?.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="layout">Layout Style</Label>
                            <Select id="layout" name="layout" defaultValue={template?.layout || 'minimal'}>
                                <option value="minimal">Minimal</option>
                                <option value="detailed">Detailed</option>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <Label>Field Visibility</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="showIVA"
                                    name="showIVA"
                                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                    defaultChecked={template?.fields?.showIVA ?? true}
                                />
                                <Label htmlFor="showIVA">Show IVA</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="showIRPF"
                                    name="showIRPF"
                                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                    defaultChecked={template?.fields?.showIRPF ?? true}
                                />
                                <Label htmlFor="showIRPF">Show IRPF</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="showFooterNotes"
                                    name="showFooterNotes"
                                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                    defaultChecked={template?.fields?.showFooterNotes ?? true}
                                />
                                <Label htmlFor="showFooterNotes">Show Footer Notes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="showSecondaryCurrency"
                                    name="showSecondaryCurrency"
                                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                    defaultChecked={template?.fields?.showSecondaryCurrency ?? false}
                                />
                                <Label htmlFor="showSecondaryCurrency">Show Secondary Currency</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit">{isEditing ? 'Save Changes' : 'Create Template'}</Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
