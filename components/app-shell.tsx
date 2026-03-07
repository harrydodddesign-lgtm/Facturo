'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    File,
    BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { SuccessBanner } from '@/components/success-banner'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string
        title: string
        icon: React.ReactNode
    }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'justify-start text-sm font-medium transition-colors flex items-center px-3 py-2 rounded-md',
                        pathname === item.href || pathname.startsWith(item.href + '/')
                            ? 'bg-neutral-100 text-neutral-900'
                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                    )}
                >
                    <span className="mr-2">{item.icon}</span>
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const navItems = [
        {
            title: 'Dashboard',
            href: '/app',
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            title: 'Invoices',
            href: '/app/invoices',
            icon: <FileText className="h-4 w-4" />,
        },
        {
            title: 'Clients',
            href: '/app/clients',
            icon: <Users className="h-4 w-4" />,
        },
        {
            title: 'Templates',
            href: '/app/templates',
            icon: <File className="h-4 w-4" />,
        },
        {
            title: 'Reports',
            href: '/app/reports',
            icon: <BarChart3 className="h-4 w-4" />,
        },
        {
            title: 'Settings',
            href: '/app/settings',
            icon: <Settings className="h-4 w-4" />,
        },
    ]

    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-white">
            <aside className="w-full lg:w-64 border-r border-neutral-200 bg-neutral-50/50 lg:min-h-screen">
                <div className="flex h-14 items-center border-b border-neutral-200 px-6">
                    <Link href="/app" className="flex items-center font-semibold text-neutral-900">
                        <LayoutDashboard className="mr-2 h-5 w-5" />
                        <span>Facturo</span>
                    </Link>
                </div>
                <div className="p-4">
                    <SidebarNav items={navItems} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 lg:block hidden">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>
            <main className="flex-1 lg:p-8 p-4 overflow-y-auto">
                <Suspense fallback={null}>
                    <SuccessBanner />
                </Suspense>
                {children}
            </main>
        </div>
    )
}
