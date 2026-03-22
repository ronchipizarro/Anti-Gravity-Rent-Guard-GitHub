'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { useBroker } from '@/components/broker/BrokerContext'
import PropertyCard from '@/components/broker/PropertyCard'
import { supabase } from '@/lib/supabase'

export default function BrokerPropertiesPage() {
    const broker = useBroker()
    const [properties, setProperties] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetch() {
            if (!supabase) return
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await window.fetch('/api/broker/properties', {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            })
            if (res.ok) setProperties(await res.json())
            setLoading(false)
        }
        fetch()
    }, [broker.id])

    return (
        <div className="pt-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Properties</h1>
                    <p className="text-gray-500 text-sm mt-1">{properties.length} propert{properties.length === 1 ? 'y' : 'ies'} enrolled</p>
                </div>
                <Link href="/broker/enroll" className="flex items-center gap-2 bg-white text-black font-semibold py-2.5 px-5 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                    <PlusCircle size={16} /> Enroll Property
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 h-40 animate-pulse" />
                    ))}
                </div>
            ) : properties.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                    <PlusCircle size={40} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No properties yet</h3>
                    <p className="text-gray-500 text-sm mb-6">Enroll your first property to get started</p>
                    <Link href="/broker/enroll" className="inline-flex items-center gap-2 bg-white text-black font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                        <PlusCircle size={16} /> Enroll Property
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
            )}
        </div>
    )
}
