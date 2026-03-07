import Link from 'next/link'
import { getClients } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { DeleteButton } from '@/components/delete-button'
import { deleteClientAction } from '@/lib/actions'

export default async function ClientsPage() {
    const clients = await getClients()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Clients</h1>
                    <p className="text-neutral-500">Manage your client base.</p>
                </div>
                <Link href="/app/clients/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Client
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border border-neutral-200 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>VAT No.</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-neutral-500">
                                    No clients found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/app/clients/${client.id}`} className="hover:underline">
                                            {client.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{client.client_code}</TableCell>
                                    <TableCell>{client.nif || '—'}</TableCell>
                                    <TableCell>{client.preferred_currency}</TableCell>
                                    <TableCell>{client.email || client.contact}</TableCell>
                                    <TableCell className="text-right">
                                        <DeleteButton
                                            deleteAction={deleteClientAction.bind(null, client.id)}
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
