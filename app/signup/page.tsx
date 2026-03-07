'use client'

import { useActionState } from 'react'
import { signup, AuthState } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const initialState: AuthState = {
    error: '',
    message: '',
    success: false
}

export default function SignupPage() {
    const [state, formAction] = useActionState(signup, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>Get started with Facturo today.</CardDescription>
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
                            <div className="text-sm text-red-500 font-medium">
                                {state.error}
                            </div>
                        )}
                        {state?.message && (
                            <div className="text-sm text-green-600 font-medium">
                                {state.message}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full">Sign up</Button>
                        <div className="text-center text-sm text-neutral-500">
                            Already have an account?{' '}
                            <Link href="/login" className="underline hover:text-neutral-900">
                                Log in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
