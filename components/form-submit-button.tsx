'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

interface FormSubmitButtonProps {
    children: React.ReactNode
    className?: string
    variant?: 'default' | 'ghost' | 'outline'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    pendingText?: string
}

export function FormSubmitButton({
    children,
    className,
    variant = 'ghost',
    size = 'sm',
    pendingText,
}: FormSubmitButtonProps) {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            variant={variant}
            size={size}
            className={className}
            disabled={pending}
            aria-disabled={pending}
        >
            {pending ? (pendingText ?? '…') : children}
        </Button>
    )
}
