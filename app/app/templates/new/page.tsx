import { TemplateForm } from '../template-form'

export const dynamic = 'force-dynamic'

export default function NewTemplatePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">New Template</h1>
                <p className="text-neutral-500">Design a new invoice template.</p>
            </div>
            <TemplateForm />
        </div>
    )
}
