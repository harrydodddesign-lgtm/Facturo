import { getTemplate } from '@/lib/data'
import { TemplateForm } from '../template-form'

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const template = await getTemplate(id)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Edit Template</h1>
                <p className="text-neutral-500">Update template settings.</p>
            </div>
            <TemplateForm template={template} />
        </div>
    )
}
