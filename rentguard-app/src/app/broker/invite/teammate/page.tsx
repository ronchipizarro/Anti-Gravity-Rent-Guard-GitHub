'use client'

import { useEffect, useState } from 'react'
import { Send, ShieldAlert } from 'lucide-react'
import { useBroker } from '@/components/broker/BrokerContext'
import InvitationTable from '@/components/broker/InvitationTable'
import { supabase } from '@/lib/supabase'

export default function InviteTeammatePage() {
    const broker = useBroker()
    const [role, setRole] = useState<'broker' | 'realtor'>('realtor')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [invitations, setInvitations] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    // Only brokers can access this page
    if (broker.role !== 'broker') {
        return (
            <div className="pt-4 text-center">
                <ShieldAlert size={40} className="text-gray-600 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-white mb-2">Access Restricted</h2>
                <p className="text-gray-500 text-sm">Only brokers can invite teammates.</p>
            </div>
        )
    }

    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
        async function fetchData() {
            if (!supabase) return
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await window.fetch('/api/broker/teammates', {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            })
            if (res.ok) setInvitations(await res.json())
        }
        fetchData()
    }, [broker.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            if (!supabase) throw new Error('Supabase not configured')
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            const res = await window.fetch('/api/broker/teammates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ full_name: fullName, email, role }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to send invitation')
            }

            const newInv = await res.json()
            setInvitations(prev => [newInv, ...prev])
            setFullName('')
            setEmail('')
            setSuccess(`Invitation sent to ${email}!`)
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-4 max-w-3xl">
            <h1 className="text-2xl font-bold text-white mb-1">Invite Teammate</h1>
            <p className="text-gray-500 text-sm mb-6">Add a broker or realtor to your brokerage</p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
                    )}
                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3">{success}</div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-3 block">Role</label>
                        <div className="flex gap-3">
                            {(['realtor', 'broker'] as const).map(r => (
                                <button key={r} type="button" onClick={() => setRole(r)}
                                    className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ${role === r ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Full Name <span className="text-blue-400">*</span></label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Smith" required className="input-field" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Email <span className="text-blue-400">*</span></label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@realty.com" required className="input-field" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="flex items-center gap-2 bg-white text-black font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <><Send size={16} /> Send Invitation</>
                        )}
                    </button>
                </form>
            </div>

            <h2 className="text-lg font-semibold text-white mb-4">Teammate Invitations</h2>
            <InvitationTable invitations={invitations} showProperty={false} />
        </div>
    )
}
