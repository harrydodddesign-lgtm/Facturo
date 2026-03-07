import Link from 'next/link'
import { getTemplates } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { DeleteButton } from '@/components/delete-button'
import { deleteTemplateAction } from '@/lib/actions'

export default async function TemplatesPage() {
    const templates = await getTemplates()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Templates</h1>
                    <p className="text-neutral-500">Manage your invoice templates.</p>
                </div>
                <Link href="/app/templates/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Template
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border border-neutral-200 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Layout</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-neutral-500">
                                    No templates found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/app/templates/${template.id}`} className="hover:underline">
                                            {template.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="capitalize">{template.layout}</TableCell>
                                    <TableCell>{new Date(template.updated_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DeleteButton
                                            deleteAction={deleteTemplateAction.bind(null, template.id)}
                                            label="Delete"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
