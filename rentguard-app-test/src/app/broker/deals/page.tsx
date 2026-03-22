'use client'

import { useEffect, useState } from 'react'
import { useBroker } from '@/components/broker/BrokerContext'
import { supabase } from '@/lib/supabase'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
    PENDING_TENANT: '#eab308',
    PENDING_REVIEW: '#f59e0b',
    APPROVED: '#22c55e',
    REJECTED: '#ef4444',
    CONTRACT_SENT: '#06b6d4',
    CONTRACT_SIGNED: '#14b8a6',
    PAYMENT_PENDING: '#f97316',
    ACTIVE: '#10b981',
    PRE_APPROVED: '#84cc16',
    PENDING_UNDERWRITER_REVIEW: '#a855f7',
}

const STATUS_LABELS: Record<string, string> = {
    PENDING_TENANT: 'Pending Tenant',
    PENDING_REVIEW: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CONTRACT_SENT: 'Contract Sent',
    CONTRACT_SIGNED: 'Contract Signed',
    PAYMENT_PENDING: 'Payment Pending',
    ACTIVE: 'Active',
    PRE_APPROVED: 'Pre-Approved',
    PENDING_UNDERWRITER_REVIEW: 'Under Review',
}

export default function DealsPage() {
    const broker = useBroker()
    const [deals, setDeals] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(true)
    const [stageFilter, setStageFilter] = useState('all')
    const [propertyFilter, setPropertyFilter] = useState('all')

    useEffect(() => {
        async function fetchDeals() {
            if (!supabase) return
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await window.fetch('/api/broker/deals', {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            })
            if (res.ok) setDeals(await res.json())
            setLoading(false)
        }
        fetchDeals()
    }, [broker.id])

    // Chart data
    const statusCounts: Record<string, number> = {}
    deals.forEach(d => {
        const s = d.status || 'UNKNOWN'
        statusCounts[s] = (statusCounts[s] || 0) + 1
    })
    const pieData = Object.entries(statusCounts).map(([name, value]) => ({
        name: STATUS_LABELS[name] || name,
        value,
        color: STATUS_COLORS[name] || '#6b7280',
    }))

    // Line chart: applications per day (last 30 days)
    const last30 = new Date()
    last30.setDate(last30.getDate() - 30)
    const dailyCounts: Record<string, number> = {}
    deals.forEach(d => {
        const date = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })
    const lineData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }))

    // Filtered deals
    const filtered = deals.filter(d => {
        if (stageFilter !== 'all' && d.status !== stageFilter) return false
        if (propertyFilter !== 'all' && d.property_id !== propertyFilter) return false
        return true
    })

    const uniqueStatuses = Array.from(new Set(deals.map(d => d.status)))
    const uniqueProperties = deals.reduce((acc: any[], d) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (d.properties && !acc.find(p => p.id === d.property_id)) {
            acc.push({ id: d.property_id, address: d.properties.address })
        }
        return acc
    }, [])

    return (
        <div className="pt-4">
            <h1 className="text-2xl font-bold text-white mb-1">Deals</h1>
            <p className="text-gray-500 text-sm mb-6">Track your applications and pipeline</p>

            {/* Charts */}
            {deals.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-sm font-medium text-gray-400 mb-4">By Status</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-sm font-medium text-gray-400 mb-4">Over Time</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#fff" strokeWidth={2} dot={{ fill: '#fff', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Filters — only show when there are deals */}
            {deals.length > 0 && (
                <div className="flex gap-3 mb-4">
                    <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="input-field appearance-none text-white text-sm w-auto">
                        <option value="all" className="bg-black">All Stages</option>
                        {uniqueStatuses.map(s => (
                            <option key={s} value={s} className="bg-black">{STATUS_LABELS[s] || s}</option>
                        ))}
                    </select>
                    <select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} className="input-field appearance-none text-white text-sm w-auto">
                        <option value="all" className="bg-black">All Properties</option>
                        {uniqueProperties.map((p: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                            <option key={p.id} value={p.id} className="bg-black">{p.address}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Deals Table */}
            {loading ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 animate-pulse h-48" />
            ) : filtered.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                    <p className="text-gray-500 text-sm">No deals yet. Enroll a property and invite tenants to get started.</p>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Property</th>
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Tenant</th>
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Stage</th>
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Rent</th>
                                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(deal => (
                                    <tr key={deal.id} className="border-b border-white/5 hover:bg-white/3">
                                        <td className="px-4 py-3 text-white font-medium truncate max-w-[200px]">
                                            {deal.properties?.address || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">
                                            {deal.tenant_data?.full_name || deal.owner_data?.tenant_name || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-semibold px-2 py-1 rounded-full border" style={{
                                                backgroundColor: `${STATUS_COLORS[deal.status] || '#6b7280'}20`,
                                                color: STATUS_COLORS[deal.status] || '#6b7280',
                                                borderColor: `${STATUS_COLORS[deal.status] || '#6b7280'}40`,
                                            }}>
                                                {STATUS_LABELS[deal.status] || deal.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-white">
                                            ${Number(deal.properties?.monthly_rent || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {new Date(deal.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
