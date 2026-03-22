'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send } from 'lucide-react'
import { useBroker } from '@/components/broker/BrokerContext'
import InvitationTable from '@/components/broker/InvitationTable'
import { supabase } from '@/lib/supabase'

export default function InviteRenterPage() {
    const broker = useBroker()
    const searchParams = useSearchParams()
    const preselectedProperty = searchParams.get('property')

    const [renterName, setRenterName] = useState('')
    const [renterEmail, setRenterEmail] = useState('')
    const [propertyId, setPropertyId] = useState(preselectedProperty || '')
    const [properties, setProperties] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [invitations, setInvitations] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchData() {
            if (!supabase) return
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const [propsRes, invRes] = await Promise.all([
                window.fetch('/api/broker/properties', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
                window.fetch('/api/broker/invitations', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
            ])

            if (propsRes.ok) setProperties(await propsRes.json())
            if (invRes.ok) {
                const allInv = await invRes.json()
                setInvitations(allInv.filter((i: any) => ['renter', 'co_renter'].includes(i.role))) // eslint-disable-line @typescript-eslint/no-explicit-any
            }
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

            const res = await window.fetch('/api/broker/invitations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ renter_name: renterName, renter_email: renterEmail, property_id: propertyId }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to send invitation')
            }

            const newInv = await res.json()
            setInvitations(prev => [{ ...newInv, properties: properties.find(p => p.id === propertyId) }, ...prev])
            setRenterName('')
            setRenterEmail('')
            setSuccess(`Invitation sent to ${renterEmail}!`)
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-4 max-w-3xl">
            <h1 className="text-2xl font-bold text-white mb-1">Invite Renter</h1>
            <p className="text-gray-500 text-sm mb-6">Send a tenant application link to a renter</p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
                    )}
                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3">{success}</div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Renter Full Name <span className="text-blue-400">*</span></label>
                            <input type="text" value={renterName} onChange={e => setRenterName(e.target.value)} placeholder="Jane Doe" required className="input-field" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Renter Email <span className="text-blue-400">*</span></label>
                            <input type="email" value={renterEmail} onChange={e => setRenterEmail(e.target.value)} placeholder="jane@email.com" required className="input-field" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Which Property? <span className="text-blue-400">*</span></label>
                        <select value={propertyId} onChange={e => setPropertyId(e.target.value)} required className="input-field appearance-none text-white">
                            <option value="" className="bg-black">Select a property...</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id} className="bg-black">{p.address}, {p.city}</option>
                            ))}
                        </select>
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

            {/* Invitation History */}
            <h2 className="text-lg font-semibold text-white mb-4">Invitation History</h2>
            <InvitationTable invitations={invitations} />
        </div>
    )
}
