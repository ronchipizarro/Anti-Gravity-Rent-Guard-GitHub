'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, PlusCircle, UserPlus, TrendingUp, Home, Clock, Send, DollarSign } from 'lucide-react'
import { useBroker } from '@/components/broker/BrokerContext'
import StatCard from '@/components/broker/StatCard'
import { supabase } from '@/lib/supabase'

const actionCards = [
    { href: '/broker/enroll', icon: PlusCircle, label: 'Enroll Property', desc: 'Add new properties to your portfolio' },
    { href: '/broker/properties', icon: Building2, label: 'My Properties', desc: 'View all your enrolled properties' },
    { href: '/broker/invite/renter', icon: UserPlus, label: 'Invite Renter', desc: 'Send tenant application links' },
    { href: '/broker/deals', icon: TrendingUp, label: 'My Deals', desc: 'Track application status & pipeline' },
]

interface Stats {
    properties: number
    deals: number
    invitations: number
}

export default function BrokerDashboardPage() {
    const broker = useBroker()
    const [stats, setStats] = useState<Stats>({ properties: 0, deals: 0, invitations: 0 })

    useEffect(() => {
        async function fetchStats() {
            if (!supabase) return

            const [propsRes, dealsRes, invRes] = await Promise.all([
                supabase.from('properties').select('id', { count: 'exact', head: true }).eq('broker_id', broker.id),
                supabase.from('applications').select('id', { count: 'exact', head: true }).eq('broker_id', broker.id),
                supabase.from('invitations').select('id', { count: 'exact', head: true }).eq('broker_id', broker.id).eq('status', 'pending'),
            ])

            setStats({
                properties: propsRes.count || 0,
                deals: dealsRes.count || 0,
                invitations: invRes.count || 0,
            })
        }
        fetchStats()
    }, [broker.id])

    return (
        <div className="pt-4">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {broker.full_name}!</h1>
            <p className="text-gray-500 text-sm mb-8">Here&apos;s what&apos;s happening with your portfolio</p>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {actionCards.map(card => {
                    const Icon = card.icon
                    return (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 hover:border-white/20 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                                <Icon size={20} className="text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-white">{card.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
                        </Link>
                    )
                })}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Home} label="Total Properties" value={stats.properties} />
                <StatCard icon={TrendingUp} label="Active Deals" value={stats.deals} />
                <StatCard icon={Send} label="Pending Invitations" value={stats.invitations} />
                <StatCard icon={DollarSign} label="Commission Earned" value="$0.00" />
            </div>
        </div>
    )
}
