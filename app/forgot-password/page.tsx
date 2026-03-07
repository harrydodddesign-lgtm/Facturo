'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const initialState = { error: '', message: '' }

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(resetPassword, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Reset your password</CardTitle>
                    <CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required placeholder="m@example.com" />
                        </div>
                        {state?.error && (
                            <p className="text-sm text-red-500 font-medium">{state.error}</p>
                        )}
                        {state?.message && (
                            <p className="text-sm text-green-600 font-medium">{state.message}</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full">Send Reset Link</Button>
                        <div className="text-center text-sm text-neutral-500">
                            Remember your password?{' '}
                            <Link href="/login" className="underline hover:text-neutral-900">Log in</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
