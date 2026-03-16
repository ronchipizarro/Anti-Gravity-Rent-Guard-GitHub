'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Suspense } from 'react'
import {
    ArrowLeft, CheckCircle, XCircle, AlertTriangle, Shield,
    User, Briefcase, DollarSign, FileText, ExternalLink,
    Lock, LayoutDashboard, FileSignature, CreditCard
} from 'lucide-react'

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://rentguard.com'

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
            <div className={`glass-card max-w-sm w-full text-center transition-all ${shake ? 'translate-x-2' : ''}`}>
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-5">
                    <Lock size={22} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Underwriting Portal</h2>
                <p className="text-gray-500 text-sm mb-6">Sign in to access the portal</p>
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
                    <button type="submit" className="btn-primary w-full mt-1">Sign In</button>
                </form>
            </div>
        </div>
    )
}

function UnderwriteReviewContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params.id as string
    const presetAction = searchParams.get('action')

    const [authenticated, setAuthenticated] = useState(false)
    const [app, setApp] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(true)
    const [deciding, setDeciding] = useState(false)
    const [decided, setDecided] = useState(false)
    const [decisionResult, setDecisionResult] = useState<string>('')
    const [error, setError] = useState('')
    const [docUrls, setDocUrls] = useState<Record<string, string>>({})
    const [phase2Toast, setPhase2Toast] = useState('')

    // Check session auth
    useEffect(() => {
        if (typeof window !== 'undefined' && sessionStorage.getItem('uw_auth') === '1') {
            setAuthenticated(true)
        } else {
            setLoading(false)
        }
    }, [])

    const handleDecision = async (action: string) => {
        setDeciding(true)
        try {
            const res = await fetch('/api/underwrite/decision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: id, action }),
            })
            const result = await res.json()
            if (result.success) {
                setDecided(true)
                setDecisionResult(action)
            } else {
                alert(result.error || 'Decision failed.')
            }
        } catch (err) {
            console.error(err)
            alert('Failed to submit decision.')
        } finally {
            setDeciding(false)
        }
    }

    useEffect(() => {
        const fetchApp = async () => {
            if (!authenticated) return
            if (!supabase) {
                setError('Database not configured.')
                setLoading(false)
                return
            }
            const { data, error: fetchError } = await supabase
                .from('applications')
                .select('*')
                .eq('id', id)
                .single()

            if (fetchError || !data) {
                setError('Application not found.')
            } else {
                setApp(data)
                // Generate signed URLs for all documents in this application (private bucket)
                const allPaths: string[] = [
                    ...Object.values(data.documents || {}),
                    ...Object.values(data.tenant_data?.documents || {}),
                    ...Object.values(data.owner_data?.documents || {}),
                ]
                const urls: Record<string, string> = {}
                await Promise.all(
                    allPaths.map(async (p) => {
                        const path = p as string
                        const { data: signed } = await supabase!.storage
                            .from('documents')
                            .createSignedUrl(path, 3600)
                        if (signed?.signedUrl) urls[path] = signed.signedUrl
                    })
                )
                setDocUrls(urls)
            }
            setLoading(false)
        }
        fetchApp()
    }, [id, authenticated])

    useEffect(() => {
        if (presetAction && !decided && !loading && app) {
            handleDecision(presetAction)
        }
    }, [presetAction, decided, loading, app]) // eslint-disable-line react-hooks/exhaustive-deps

    const ownerData = app?.owner_data || {}
    const tenantData = app?.tenant_data || {}
    const decision = app?.decision || {}
    const property = ownerData?.property || {}
    const tenantPreview = ownerData?.tenant_preview || {}
    const tenantName = `${tenantData.first_name || tenantPreview.first_name || ''} ${tenantData.last_name || tenantPreview.last_name || ''}`.trim() || 'N/A'

    const buildDocUrl = (path: string) => docUrls[path] || '#'

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
            <style jsx global>{`
                .input-field {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: white;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
            `}</style>
            <div className="min-h-screen pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <a href={MARKETING_URL} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mb-6">
                        <ArrowLeft size={12} /> Back to Home
                    </a>

                    <div className="flex items-center gap-3 mb-2">
                        <Shield size={20} className="text-blue-400" />
                        <span className="section-label">Underwriting Review</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-8">
                        Application Review Portal
                    </h1>

                    {loading ? (
                        <div className="glass-card flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="glass-card text-center py-16">
                            <XCircle size={40} className="text-red-400 mx-auto mb-4" />
                            <p className="text-gray-400">{error}</p>
                        </div>
                    ) : decided ? (
                        <div className="space-y-4">
                            {/* Decision result header */}
                            <div className="glass-card text-center py-10 flex flex-col items-center gap-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${decisionResult === 'approve' ? 'bg-green-500/10 border border-green-500/30' :
                                    decisionResult === 'reject' ? 'bg-red-500/10 border border-red-500/30' :
                                        'bg-yellow-500/10 border border-yellow-500/30'
                                    }`}>
                                    {decisionResult === 'approve' ? <CheckCircle size={28} className="text-green-400" /> :
                                        decisionResult === 'reject' ? <XCircle size={28} className="text-red-400" /> :
                                            <AlertTriangle size={28} className="text-yellow-400" />}
                                </div>
                                <h2 className="text-2xl font-bold text-white">
                                    {decisionResult === 'approve' ? 'Application Approved' :
                                        decisionResult === 'reject' ? 'Application Rejected' :
                                            'Cosigner Requested'}
                                </h2>
                                <p className="text-gray-400 text-sm max-w-md">
                                    {decisionResult === 'approve' ? 'The tenant has been notified of the approval.' :
                                        decisionResult === 'reject' ? 'The tenant has been notified of the rejection.' :
                                            'The tenant has been notified and will receive a link to submit cosigner details.'}
                                </p>
                            </div>

                            {/* Post-approval next steps (approval only) */}
                            {decisionResult === 'approve' && (
                                <div className="glass-card border-green-500/20">
                                    <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                                        <CheckCircle size={15} className="text-green-400" /> Next Steps
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-5">Complete the following to activate rental protection.</p>

                                    {/* Fee payer info */}
                                    {ownerData?.fee_payer && (
                                        <div className="mb-5 px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                            <CreditCard size={15} className="text-blue-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fee Responsibility</p>
                                                <p className="text-sm text-white font-semibold capitalize">{ownerData.fee_payer} pays the RentGuard protection fee</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPhase2Toast('Contract sending via Dropbox Sign coming in Phase 2.')}
                                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20">
                                                <FileSignature size={16} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">Send Contracts</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Rental + protection agreement</p>
                                            </div>
                                            <span className="ml-auto text-[10px] text-blue-400/70 border border-blue-500/20 rounded px-1.5 py-0.5">Phase 2</span>
                                        </button>

                                        <button
                                            onClick={() => setPhase2Toast('Stripe payment links coming in Phase 2.')}
                                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 hover:bg-green-500/5 transition-all text-left group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20">
                                                <CreditCard size={16} className="text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">Request Payment</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Send Stripe payment link</p>
                                            </div>
                                            <span className="ml-auto text-[10px] text-green-400/70 border border-green-500/20 rounded px-1.5 py-0.5">Phase 2</span>
                                        </button>
                                    </div>

                                    {phase2Toast && (
                                        <div className="mt-4 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                                            <AlertTriangle size={13} className="text-blue-400 flex-shrink-0" />
                                            <p className="text-xs text-blue-300">{phase2Toast}</p>
                                            <button onClick={() => setPhase2Toast('')} className="ml-auto text-gray-500 hover:text-white text-xs">✕</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Back to dashboard */}
                            <div className="flex justify-center pt-2">
                                <Link href="/underwrite"
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">
                                    <LayoutDashboard size={14} /> Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Status & AI Recommendation */}
                            <div className="glass-card">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-white">Status & AI Recommendation</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${app.status === 'APPROVED' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                                        app.status === 'REJECTED' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                                            'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">AI Tier</p>
                                        <p className={`text-xl font-bold ${decision.tier === 'GREEN' ? 'text-green-400' :
                                            decision.tier === 'YELLOW' ? 'text-yellow-400' : 'text-red-400'
                                            }`}>{decision.tier || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Score</p>
                                        <p className="text-xl font-bold text-white">{decision.score ?? 'N/A'}/100</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Label</p>
                                        <p className="text-sm font-semibold text-white">{decision.label || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">Rent</p>
                                        <p className="text-xl font-bold text-white">${property.monthly_rent || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Rules Breakdown */}
                                {decision.rules?.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-gray-300 mb-3">Rule-by-Rule Breakdown</h3>
                                        {decision.rules.map((rule: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${rule.tier === 'GREEN' ? 'bg-green-500/5 border-green-500/20' :
                                                rule.tier === 'YELLOW' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                                    'bg-red-500/5 border-red-500/20'
                                                }`}>
                                                <div className="mt-0.5">
                                                    {rule.passed
                                                        ? <CheckCircle size={14} className="text-green-400" />
                                                        : <XCircle size={14} className={rule.tier === 'YELLOW' ? 'text-yellow-400' : 'text-red-400'} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{rule.rule}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{rule.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tenant Data */}
                            <div className="glass-card">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <User size={16} className="text-blue-400" /> Tenant Information
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                    <InfoRow label="Name" value={tenantName} />
                                    <InfoRow label="Email" value={tenantData.email || tenantPreview.email || 'N/A'} />
                                    <InfoRow label="Phone" value={tenantData.phone || tenantPreview.phone || 'N/A'} />
                                    <InfoRow label="DOB" value={tenantData.dob || 'N/A'} />
                                    <InfoRow label="SSN (Last 4)" value={tenantData.ssn_last4 || 'N/A'} />
                                </div>
                            </div>

                            {/* Employment */}
                            <div className="glass-card">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Briefcase size={16} className="text-blue-400" /> Employment & Income
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                    <InfoRow label="Status" value={tenantData.employment_status || tenantPreview.employment || 'N/A'} />
                                    <InfoRow label="Employer" value={tenantData.employer || 'N/A'} />
                                    <InfoRow label="Job Title" value={tenantData.job_title || 'N/A'} />
                                    <InfoRow label="Years at Job" value={tenantData.years_employed || 'N/A'} />
                                    <InfoRow label="Gross Monthly Income" value={tenantData.gross_income ? `$${tenantData.gross_income}` : tenantPreview.income ? `$${tenantPreview.income}` : 'N/A'} />
                                    <InfoRow label="Other Income" value={tenantData.other_income ? `$${tenantData.other_income}` : 'N/A'} />
                                </div>
                            </div>

                            {/* Property */}
                            <div className="glass-card">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <DollarSign size={16} className="text-blue-400" /> Property Details
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                    <InfoRow label="Address" value={property.address || 'N/A'} />
                                    <InfoRow label="City" value={property.city || 'N/A'} />
                                    <InfoRow label="State" value={property.state || 'N/A'} />
                                    <InfoRow label="ZIP" value={property.zip || 'N/A'} />
                                    <InfoRow label="Type" value={property.type || 'N/A'} />
                                    <InfoRow label="Monthly Rent" value={property.monthly_rent ? `$${property.monthly_rent}` : 'N/A'} />
                                    <InfoRow label="Fee Payer" value={ownerData.fee_payer ? `${ownerData.fee_payer.charAt(0).toUpperCase() + ownerData.fee_payer.slice(1)} pays RentGuard fee` : 'N/A'} />
                                    <InfoRow label="Owner Email" value={ownerData.email || 'N/A'} />
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="glass-card">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText size={16} className="text-blue-400" /> Uploaded Documents
                                </h2>
                                {app.documents && Object.keys(app.documents).length > 0 ? (
                                    <div className="space-y-2">
                                        {Object.entries(app.documents).map(([key, path]: [string, any]) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                            <a key={key} href={buildDocUrl(path)} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
                                                <FileText size={16} className="text-gray-500 group-hover:text-blue-400" />
                                                <span className="text-sm text-gray-300 group-hover:text-white">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                                <ExternalLink size={12} className="text-gray-600 ml-auto group-hover:text-blue-400" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No documents uploaded.</p>
                                )}

                                {tenantData.documents && Object.keys(tenantData.documents).length > 0 && (
                                    <>
                                        <h3 className="text-sm font-medium text-gray-300 mt-6 mb-3">Tenant-Submitted Documents</h3>
                                        <div className="space-y-2">
                                            {Object.entries(tenantData.documents).map(([key, path]: [string, any]) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                <a key={key} href={buildDocUrl(path)} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
                                                    <FileText size={16} className="text-gray-500 group-hover:text-blue-400" />
                                                    <span className="text-sm text-gray-300 group-hover:text-white">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                                    <ExternalLink size={12} className="text-gray-600 ml-auto group-hover:text-blue-400" />
                                                </a>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Decision Buttons */}
                            <div className="glass-card border-2 border-white/10">
                                <h2 className="text-lg font-semibold text-white mb-6">Make Your Decision</h2>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => handleDecision('approve')}
                                        disabled={deciding}
                                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {deciding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={18} /> Approve</>}
                                    </button>
                                    <button
                                        onClick={() => handleDecision('reject')}
                                        disabled={deciding}
                                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {deciding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><XCircle size={18} /> Reject</>}
                                    </button>
                                    <button
                                        onClick={() => handleDecision('cosigner')}
                                        disabled={deciding}
                                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {deciding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><AlertTriangle size={18} /> Request Cosigner</>}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-4">
                                    Cosigner must be W-2 employed, 6+ months tenure, and ≥ 3× income-to-rent ratio.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default function UnderwriteReviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <UnderwriteReviewContent />
        </Suspense>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</span>
            <span className="text-white">{value}</span>
        </div>
    )
}
