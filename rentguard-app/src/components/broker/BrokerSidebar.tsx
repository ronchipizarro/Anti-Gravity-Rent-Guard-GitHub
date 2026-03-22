'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Building2, PlusCircle, UserPlus, Users,
    TrendingUp, BookOpen, Settings, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { useBroker } from './BrokerContext'
import { signOutBroker } from '@/lib/broker-auth'
import { useRouter } from 'next/navigation'

const navItems = [
    { href: '/broker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/broker/properties', label: 'Properties', icon: Building2 },
    { href: '/broker/enroll', label: 'Enroll Property', icon: PlusCircle },
    { href: '/broker/invite/renter', label: 'Invite Renter', icon: UserPlus },
    { href: '/broker/invite/teammate', label: 'Invite Teammate', icon: Users, brokerOnly: true },
    { href: '/broker/deals', label: 'Deals', icon: TrendingUp },
    { href: '/broker/resources', label: 'Resources', icon: BookOpen },
    { href: '/broker/settings', label: 'Settings', icon: Settings },
]

const roleBadgeColors: Record<string, string> = {
    broker: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    realtor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export default function BrokerSidebar() {
    const broker = useBroker()
    const pathname = usePathname()
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleSignOut = async () => {
        await signOutBroker()
        router.push('/broker/login')
    }

    const filteredItems = navItems.filter(item =>
        !item.brokerOnly || broker.role === 'broker'
    )

    const sidebar = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-white/10">
                <Link href="/broker/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                        <span className="text-black font-black text-sm">R</span>
                    </div>
                    <div>
                        <span className="font-semibold text-white text-sm">RentGuard</span>
                        <span className="block text-[10px] text-gray-500 -mt-0.5">Portal</span>
                    </div>
                </Link>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {filteredItems.map(item => {
                    const Icon = item.icon
                    const active = pathname === item.href || (item.href !== '/broker/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${active
                                ? 'bg-white text-black'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* User Info + Sign Out */}
            <div className="px-4 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white">
                        {broker.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{broker.full_name}</p>
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border ${roleBadgeColors[broker.role] || 'bg-white/10 text-gray-400'}`}>
                            {broker.role.charAt(0).toUpperCase() + broker.role.slice(1)}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors w-full"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-white/10 text-white"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-black border-r border-white/10 z-40 transition-transform duration-200
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {sidebar}
            </aside>
        </>
    )
}
