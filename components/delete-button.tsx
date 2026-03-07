'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface DeleteButtonProps {
    deleteAction: () => Promise<void>
    label?: string
}

export function DeleteButton({ deleteAction, label = 'Delete' }: DeleteButtonProps) {
    const [confirming, setConfirming] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Auto-cancel confirmation after 3 seconds
    useEffect(() => {
        if (confirming) {
            timerRef.current = setTimeout(() => setConfirming(false), 3000)
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [confirming])

    if (confirming) {
        return (
            <div className="flex items-center gap-1">
                <form action={deleteAction}>
                    <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 bg-red-600 text-white hover:bg-red-700"
                    >
                        Confirm
                    </Button>
                </form>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 text-neutral-500"
                    onClick={() => setConfirming(false)}
                >
                    Cancel
                </Button>
            </div>
        )
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setConfirming(true)}
        >
            {label}
        </Button>
    )
}
