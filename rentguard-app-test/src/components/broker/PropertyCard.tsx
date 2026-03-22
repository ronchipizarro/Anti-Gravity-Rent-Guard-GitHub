'use client'

import Link from 'next/link'
import { Home, Building, Building2, Store, Warehouse, Hotel, Bed } from 'lucide-react'

const typeIcons: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
    house: Home,
    townhome: Building,
    apartment_condo: Building2,
    commercial: Store,
    multi_family: Warehouse,
    apartment_building: Hotel,
}

const statusConfig: Record<string, { label: string; color: string }> = {
    enrolled: { label: 'Enrolled', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    invitations_sent: { label: 'Invitations Sent', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    tenant_applied: { label: 'Tenant Applied', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    under_review: { label: 'Under Review', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    approved: { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    contract_sent: { label: 'Contract Sent', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    contract_signed: { label: 'Contract Signed', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    payment_pending: { label: 'Payment Pending', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    active: { label: 'Active', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

interface Property {
    id: string
    property_type: string
    address: string
    city: string
    state: string
    monthly_rent: number
    bedrooms: number | null
    status: string
}

export default function PropertyCard({ property }: { property: Property }) {
    const Icon = typeIcons[property.property_type] || Home
    const status = statusConfig[property.status] || statusConfig.enrolled

    return (
        <Link
            href={`/broker/properties/${property.id}`}
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 hover:border-white/20 transition-all group block"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Icon size={20} className="text-white" />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${status.color}`}>
                    {status.label}
                </span>
            </div>
            <p className="text-sm font-semibold text-white truncate">{property.address}</p>
            <p className="text-xs text-gray-500">{property.city}, {property.state}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <span className="text-sm font-bold text-white">${Number(property.monthly_rent).toLocaleString()}/mo</span>
                {property.bedrooms && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Bed size={12} /> {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                    </span>
                )}
            </div>
        </Link>
    )
}
