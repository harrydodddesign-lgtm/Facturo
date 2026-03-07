'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { X, CheckCircle } from 'lucide-react'

export function SuccessBanner() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    if (searchParams.get('success') !== '1') return null

    const dismiss = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('success')
        const query = params.toString()
        router.replace(query ? `${pathname}?${query}` : pathname)
    }

    return (
        <div className="flex items-center justify-between gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-800 mb-6">
            <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Changes saved successfully.</span>
            </div>
            <button
                onClick={dismiss}
                className="text-green-600 hover:text-green-800 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
