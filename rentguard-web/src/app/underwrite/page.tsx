'use client'

import { useState, useEffect, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
    RefreshCw, Shield, ChevronRight, Search,
    CheckCircle, XCircle, Clock, AlertTriangle, Home,
    Users, TrendingUp, Eye, Lock
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Application {
    id: string
    created_at: string
    status: string
    decision?: {
        tier?: 'GREEN' | 'YELLOW' | 'RED'
        score?: number
        label?: string
    }
    tenant_data?: {
        first_name?: string
        last_name?: string
        email?: string
    }
    owner_data?: {
        email?: string
        fee_payer?: 'owner' | 'tenant'
        property?: {
            address?: string
            city?: string
            state?: string
            monthly_rent?: number | string
        }
        tenant_preview?: {
            first_name?: string
            last_name?: string
            email?: string
        }
    }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    PENDING_REVIEW:       { label: 'Review Now',        cls: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
    COSIGNER_SUBMITTED:   { label: 'Review Cosigner',   cls: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
    PENDING_COSIGNER:     { label: 'Awaiting Cosigner', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    PENDING_COSIGNER_DOCS:{ label: 'Awaiting Docs',     cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    PENDING_TENANT:       { label: 'Awaiting Tenant',   cls: 'bg-white/10 text-gray-400 border-white/20' },
    SUBMITTED:            { label: 'Submitted',         cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    APPROVED:             { label: 'Approved',          cls: 'bg-green-500/20 text-green-400 border-green-500/40' },
    CONTRACT_SENT:        { label: 'Contracts Out',     cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    CONTRACT_SIGNED:      { label: 'Payment Pending',   cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    PAYMENT_PENDING:      { label: 'Awaiting Payment',  cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    ACTIVE:               { label: 'Active',            cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    REJECTED:             { label: 'Rejected',          cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
    COMPLETED_UNDERWRITING:{ label: 'Completed',        cls: 'bg-gray-500/20 text-gray-400 border-gray-500/40' },
}

function StatusBadge({ status }: { status: string }) {
    const c = STATUS_CONFIG[status] || { label: status, cls: 'bg-white/10 text-gray-400 border-white/20' }
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${c.cls}`}>
            {c.label}
        </span>
    )
}

function TierDot({ tier }: { tier?: string }) {
    const colors: Record<string, string> = { GREEN: 'bg-green-500', YELLOW: 'bg-yellow-500', RED: 'bg-red-500' }
    return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[tier || ''] || 'bg-gray-600'}`} />
}

// ─── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: () => void }) {
    const [user, setUser] = useState('')
    const [pw, setPw] = useState('')
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const validUser = process.env.NEXT_PUBLIC_UNDERWRITER_USER || 'ADMIN'
        const validPw = process.env.NEXT_PUBLIC_UNDERWRITER_PASSWORD || 'ADMIN'
        if (user === validUser && pw === validPw) {
            sessionStorage.setItem('uw_auth', '1')
            onAuth()
        } else {
            setError(true)
            setShake(true)
            setTimeout(() => { setShake(false); setError(false) }, 1500)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className={`glass-card max-w-sm w-full text-center transition-all ${shake ? 'translate-x-2' : ''}`}
                style={{ animation: shake ? 'shake 0.3s ease-in-out' : undefined }}>
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-5">
                    <Lock size={22} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Underwriting Portal</h2>
                <p className="text-gray-500 text-sm mb-6">Sign in to access the dashboard</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            value={user}
                            onChange={e => setUser(e.target.value)}
                            placeholder="Username"
                            autoFocus
                            autoComplete="username"
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-all ${
                                error ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 focus:border-blue-500/60'
                            }`}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            value={pw}
                            onChange={e => setPw(e.target.value)}
                            placeholder="Password"
                            autoComplete="current-password"
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-all ${
                                error ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 focus:border-blue-500/60'
                            }`}
                        />
                    </div>
                    {error && <p className="text-red-400 text-xs text-center">Incorrect username or password</p>}
                    <button type="submit" className="btn-primary w-full mt-1">
                        Sign In
                    </button>
                </form>
            </div>
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
            `}</style>
        </div>
    )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconColor, label, value, sub }: {
    icon: React.ElementType; iconColor: string; label: string; value: number; sub?: string
}) {
    return (
        <div className="glass-card flex items-center gap-4 p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

// ─── Application Row ──────────────────────────────────────────────────────────

function AppRow({ app, actionQueue }: { app: Application; actionQueue?: boolean }) {
    const tenantName = [
        app.tenant_data?.first_name || app.owner_data?.tenant_preview?.first_name,
        app.tenant_data?.last_name || app.owner_data?.tenant_preview?.last_name,
    ].filter(Boolean).join(' ') || 'Unknown'

    const address = app.owner_data?.property?.address
        ? `${app.owner_data.property.address}, ${app.owner_data.property.city || ''} ${app.owner_data.property.state || ''}`.trim()
        : '—'

    const rent = app.owner_data?.property?.monthly_rent
        ? `$${app.owner_data.property.monthly_rent}/mo`
        : '—'

    return (
        <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors rounded-xl group">
            <div className="flex items-center gap-2 w-5 flex-shrink-0">
                <TierDot tier={app.decision?.tier} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{tenantName}</p>
                <p className="text-xs text-gray-500 truncate">{address}</p>
            </div>
            <div className="hidden sm:block text-xs text-gray-500 w-20 flex-shrink-0 text-right">{rent}</div>
            <div className="hidden md:flex items-center gap-1.5 w-16 flex-shrink-0 justify-center">
                {app.decision?.score !== undefined && (
                    <span className="text-xs font-semibold text-white">{app.decision.score}</span>
                )}
            </div>
            <div className="flex-shrink-0">
                <StatusBadge status={app.status} />
            </div>
            <div className="text-xs text-gray-600 hidden lg:block w-24 text-right flex-shrink-0">
                {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <Link href={`/underwrite/${app.id}`}
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                    actionQueue
                        ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                {actionQueue ? 'Review' : <Eye size={13} />}
                <ChevronRight size={12} />
            </Link>
        </div>
    )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function UnderwriteDashboard() {
    const [authenticated, setAuthenticated] = useState(false)
    const [apps, setApps] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [refreshing, setRefreshing] = useState(false)

    // Check session auth on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && sessionStorage.getItem('uw_auth') === '1') {
            setAuthenticated(true)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchApps = async () => {
        setRefreshing(true)
        try {
            const res = await fetch('/api/underwrite/applications')
            const data = await res.json()
            if (data.applications) setApps(data.applications)
        } catch (e) {
            console.error('Failed to fetch applications', e)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        if (authenticated) fetchApps()
    }, [authenticated])

    // ── Derived stats ──────────────────────────────────────────────────────────

    const stats = useMemo(() => {
        const needsReview = apps.filter(a => ['PENDING_REVIEW', 'COSIGNER_SUBMITTED'].includes(a.status)).length
        const approved = apps.filter(a => ['APPROVED', 'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PAYMENT_PENDING', 'ACTIVE'].includes(a.status)).length
        const rejected = apps.filter(a => a.status === 'REJECTED').length
        return { total: apps.length, needsReview, approved, rejected }
    }, [apps])

    const tierData = useMemo(() => {
        const counts = { GREEN: 0, YELLOW: 0, RED: 0 }
        apps.forEach(a => {
            if (a.decision?.tier && counts[a.decision.tier] !== undefined) {
                counts[a.decision.tier]++
            }
        })
        return [
            { name: 'Green', value: counts.GREEN, color: '#22c55e' },
            { name: 'Yellow', value: counts.YELLOW, color: '#eab308' },
            { name: 'Red', value: counts.RED, color: '#ef4444' },
        ].filter(d => d.value > 0)
    }, [apps])

    const funnelData = useMemo(() => {
        const stages = [
            { name: 'Submitted', statuses: ['SUBMITTED', 'PENDING_REVIEW', 'PENDING_TENANT', 'PENDING_COSIGNER', 'PENDING_COSIGNER_DOCS', 'COSIGNER_SUBMITTED', 'COMPLETED_UNDERWRITING', 'APPROVED', 'REJECTED', 'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PAYMENT_PENDING', 'ACTIVE'] },
            { name: 'In Review', statuses: ['PENDING_REVIEW', 'COSIGNER_SUBMITTED', 'PENDING_COSIGNER', 'PENDING_COSIGNER_DOCS'] },
            { name: 'Approved', statuses: ['APPROVED', 'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PAYMENT_PENDING', 'ACTIVE'] },
            { name: 'Rejected', statuses: ['REJECTED'] },
        ]
        return stages.map(s => ({
            name: s.name,
            count: apps.filter(a => s.statuses.includes(a.status)).length,
        }))
    }, [apps])

    // ── Action queue & filtered list ───────────────────────────────────────────

    const actionQueue = useMemo(() =>
        apps.filter(a => ['PENDING_REVIEW', 'COSIGNER_SUBMITTED'].includes(a.status))
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        [apps])

    const filteredApps = useMemo(() => {
        return apps.filter(a => {
            const name = [
                a.tenant_data?.first_name, a.tenant_data?.last_name,
                a.owner_data?.tenant_preview?.first_name, a.owner_data?.tenant_preview?.last_name,
                a.tenant_data?.email, a.owner_data?.tenant_preview?.email,
            ].filter(Boolean).join(' ').toLowerCase()
            const matchSearch = !search || name.includes(search.toLowerCase())
            const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
            return matchSearch && matchStatus
        })
    }, [apps, search, statusFilter])

    // ── Render ─────────────────────────────────────────────────────────────────

    if (!authenticated) {
        return (
            <>
                <PasswordGate onAuth={() => { setAuthenticated(true); setLoading(true) }} />
                <div className="min-h-screen bg-black" />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <style jsx global>{`
                .input-field {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.75rem;
                    padding: 0.6rem 1rem;
                    color: white;
                    font-size: 0.875rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-field:focus { border-color: rgba(59,130,246,0.6); }
            `}</style>

            <main className="min-h-screen pt-24 pb-20 px-4 md:px-6">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield size={16} className="text-blue-400" />
                                <span className="section-label">Underwriting Review</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchApps}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm transition-all disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm transition-all">
                                <Home size={14} /> Home
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard icon={Users} iconColor="bg-blue-500/15 text-blue-400" label="Total Applications" value={stats.total} />
                                <StatCard icon={Clock} iconColor="bg-orange-500/15 text-orange-400" label="Needs Review" value={stats.needsReview} sub="pending action" />
                                <StatCard icon={CheckCircle} iconColor="bg-green-500/15 text-green-400" label="Approved" value={stats.approved} sub="incl. active" />
                                <StatCard icon={XCircle} iconColor="bg-red-500/15 text-red-400" label="Rejected" value={stats.rejected} />
                            </div>

                            {/* Charts */}
                            {apps.length > 0 && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Tier Donut */}
                                    <div className="glass-card">
                                        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                            <TrendingUp size={15} className="text-blue-400" /> AI Tier Distribution
                                        </h2>
                                        {tierData.length > 0 ? (
                                            <div className="flex items-center gap-6">
                                                <ResponsiveContainer width={160} height={160}>
                                                    <PieChart>
                                                        <Pie data={tierData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                                                            dataKey="value" paddingAngle={3}>
                                                            {tierData.map((entry, i) => (
                                                                <Cell key={i} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                                                            formatter={(value: number, name: string) => [`${value} apps`, name]}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="flex flex-col gap-3">
                                                    {tierData.map(d => (
                                                        <div key={d.name} className="flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                                                            <span className="text-sm text-gray-300">{d.name}</span>
                                                            <span className="text-sm font-bold text-white ml-1">{d.value}</span>
                                                            <span className="text-xs text-gray-500">
                                                                ({Math.round(d.value / apps.length * 100)}%)
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 py-8 text-center">No AI decisions yet</p>
                                        )}
                                    </div>

                                    {/* Status Funnel */}
                                    <div className="glass-card">
                                        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                            <AlertTriangle size={15} className="text-blue-400" /> Application Funnel
                                        </h2>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 16 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                                                <Tooltip
                                                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                                                    formatter={(v: number) => [`${v} applications`]}
                                                />
                                                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#3b82f6" opacity={0.8} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Action Queue */}
                            <div className="glass-card border-orange-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                                        <Clock size={15} className="text-orange-400" />
                                        Needs Your Attention
                                        {actionQueue.length > 0 && (
                                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full text-xs font-bold">
                                                {actionQueue.length}
                                            </span>
                                        )}
                                    </h2>
                                </div>
                                {actionQueue.length === 0 ? (
                                    <div className="flex flex-col items-center py-10 text-center gap-2">
                                        <CheckCircle size={28} className="text-green-500/50" />
                                        <p className="text-gray-500 text-sm">All caught up! No pending reviews.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {/* Table header */}
                                        <div className="flex items-center gap-3 px-4 py-2 text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                                            <div className="w-5" />
                                            <div className="flex-1">Tenant / Property</div>
                                            <div className="hidden sm:block w-20 text-right">Rent</div>
                                            <div className="hidden md:block w-16 text-center">Score</div>
                                            <div className="flex-shrink-0 w-28">Status</div>
                                            <div className="hidden lg:block w-24 text-right">Date</div>
                                            <div className="w-20" />
                                        </div>
                                        {actionQueue.map(app => (
                                            <AppRow key={app.id} app={app} actionQueue />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* All Applications */}
                            <div className="glass-card">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                                        <Users size={15} className="text-blue-400" />
                                        All Applications
                                        <span className="text-gray-600 font-normal text-sm">({filteredApps.length})</span>
                                    </h2>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="relative">
                                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Search tenant…"
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                className="input-field pl-8 w-44 py-2 text-xs"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}
                                            className="input-field py-2 text-xs w-44 appearance-none"
                                        >
                                            <option value="ALL" className="bg-black">All Statuses</option>
                                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                                <option key={k} value={k} className="bg-black">{v.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {filteredApps.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500 text-sm">
                                        {apps.length === 0 ? 'No applications yet.' : 'No applications match your filters.'}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 px-4 py-2 text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                                            <div className="w-5" />
                                            <div className="flex-1">Tenant / Property</div>
                                            <div className="hidden sm:block w-20 text-right">Rent</div>
                                            <div className="hidden md:block w-16 text-center">Score</div>
                                            <div className="flex-shrink-0 w-28">Status</div>
                                            <div className="hidden lg:block w-24 text-right">Date</div>
                                            <div className="w-10" />
                                        </div>
                                        {filteredApps.map(app => (
                                            <AppRow key={app.id} app={app} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
