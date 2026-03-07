import { ClientForm } from '../client-form'

export const dynamic = 'force-dynamic'

export default function NewClientPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">New Client</h1>
                <p className="text-neutral-500">Add a new client to your database.</p>
            </div>
            <ClientForm />
        </div>
    )
}
