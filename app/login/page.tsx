'use client'

import { useActionState } from 'react'
import { login, AuthState } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

const initialState: AuthState = { error: '' }

export default function LoginPage() {
    const [state, formAction] = useActionState(login, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Log in to Facturo</CardTitle>
                    <CardDescription>Enter your email and password to access your account.</CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required placeholder="m@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {state?.error && (
                            <p className="text-sm text-red-500 font-medium">{state.error}</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                        <Button type="submit" className="w-full">Log in</Button>
                        <div className="text-center text-sm text-neutral-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="underline hover:text-neutral-900">Sign up</Link>
                        </div>
                        <div className="text-center text-sm">
                            <Link href="/forgot-password" className="text-neutral-400 hover:text-neutral-600 text-xs underline">Forgot password?</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
