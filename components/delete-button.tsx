'use client'

import { Button } from '@/components/ui/button'

interface DeleteButtonProps {
    deleteAction: () => Promise<void>
    label?: string
}

export function DeleteButton({ deleteAction, label = 'Delete' }: DeleteButtonProps) {
    return (
        <form action={deleteAction}>
            <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                    if (!window.confirm(`Are you sure you want to delete this? This cannot be undone.`)) {
                        e.preventDefault()
                    }
                }}
            >
                {label}
            </Button>
        </form>
    )
}
