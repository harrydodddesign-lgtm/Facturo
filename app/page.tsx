import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-16 items-center justify-between border-b border-neutral-200 px-6 lg:px-12">
        <div className="flex items-center font-bold text-xl text-neutral-900">
          Facturo
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl mb-6">
          Invoicing for freelancers <br /> in Spain.
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl mb-10">
          A minimalist, Apple-inspired invoicing tool designed for autónomos.
          Manage clients, create beautiful PDFs, and keep your finances in order.
        </p>
        <div className="flex space-x-4">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Log in</Button>
          </Link>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-neutral-400 border-t border-neutral-100">
        &copy; {new Date().getFullYear()} Facturo. All rights reserved.
      </footer>
    </div>
  )
}
