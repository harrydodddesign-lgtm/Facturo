'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
            <h2 className="text-xl font-semibold text-neutral-900">Something went wrong</h2>
            <p className="text-sm text-neutral-500 max-w-sm">
                An unexpected error occurred. Your data is safe — try refreshing or click below to retry.
            </p>
            {error.message && (
                <p className="text-xs text-neutral-400 font-mono bg-neutral-50 border border-neutral-200 rounded px-3 py-1">
                    {error.message}
                </p>
            )}
            <Button onClick={reset} variant="outline" size="sm">Try again</Button>
        </div>
    )
}
