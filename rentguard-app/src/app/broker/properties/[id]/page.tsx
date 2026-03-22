'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Home, Building, Building2, Store, Warehouse, Hotel, User, Phone, Mail } from 'lucide-react'
import { useBroker } from '@/components/broker/BrokerContext'
import ProgressStepper from '@/components/broker/ProgressStepper'
import InvitationTable from '@/components/broker/InvitationTable'
import { supabase } from '@/lib/supabase'

const typeLabels: Record<string, string> = {
    house: 'House', townhome: 'Townhome', apartment_condo: 'Apartment / Condo',
    commercial: 'Commercial', multi_family: 'Multi-Family', apartment_building: 'Apartment Building',
}

const typeIcons: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
    house: Home, townhome: Building, apartment_condo: Building2,
    commercial: Store, multi_family: Warehouse, apartment_building: Hotel,
}

export default function PropertyDetailPage() {
    const { id } = useParams()
    const broker = useBroker()
    const [property, setProperty] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetch() {
            if (!supabase) return
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await window.fetch(`/api/broker/properties/${id}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            })
            if (res.ok) setProperty(await res.json())
            setLoading(false)
        }
        fetch()
    }, [id])

    if (loading) return (
        <div className="pt-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 h-64 animate-pulse" />
        </div>
    )

    if (!property) return (
        <div className="pt-4 text-center">
            <p className="text-gray-500">Property not found</p>
            <Link href="/broker/properties" className="text-white text-sm hover:underline mt-2 inline-block">Back to Properties</Link>
        </div>
    )

    const Icon = typeIcons[property.property_type] || Home

    return (
        <div className="pt-4 max-w-4xl">
            <Link href="/broker/properties" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft size={16} /> Back to Properties
            </Link>

            {/* Progress Stepper */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <ProgressStepper status={property.status} />
            </div>

            {/* Property Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Icon size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">{property.address}</h1>
                        <p className="text-gray-400 text-sm">{property.city}, {property.state} {property.zip}</p>
                        <p className="text-gray-500 text-xs mt-1">{typeLabels[property.property_type] || property.property_type}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <InfoBox label="Monthly Rent" value={`$${Number(property.monthly_rent).toLocaleString()}`} />
                    <InfoBox label="Bedrooms" value={property.bedrooms || '—'} />
                    <InfoBox label="Lease Duration" value={`${property.lease_duration_months} mo`} />
                    <InfoBox label="Fee Payer" value={property.fee_payer.charAt(0).toUpperCase() + property.fee_payer.slice(1)} />
                    {property.floor && <InfoBox label="Floor" value={property.floor} />}
                    {property.unit_number && <InfoBox label="Unit" value={property.unit_number} />}
                    <InfoBox label="Lease Status" value={property.lease_status === 'new' ? 'New' : 'Ongoing'} />
                    {property.is_llc && <InfoBox label="LLC" value={property.llc_name || 'Yes'} />}
                </div>
            </div>

            {/* Contacts */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {property.has_owner_info && property.owner_name && (
                    <ContactCard title="Owner" name={property.owner_name} email={property.owner_email} phone={property.owner_phone} />
                )}
                {property.has_pm && property.pm_name && (
                    <ContactCard title="Property Manager" name={property.pm_name} email={property.pm_email} />
                )}
                {property.is_broker_pm && (
                    <ContactCard title="Property Manager" name={`${broker.full_name} (You)`} email={broker.email} phone={broker.phone || undefined} />
                )}
            </div>

            {/* Tenants / Invitations */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Tenants & Invitations</h2>
                    <Link href={`/broker/invite/renter?property=${property.id}`} className="flex items-center gap-2 bg-white/10 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-colors">
                        <UserPlus size={14} /> Invite Renter
                    </Link>
                </div>
                <InvitationTable invitations={property.invitations || []} showProperty={false} />
            </div>
        </div>
    )
}

function InfoBox({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-white/5 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
        </div>
    )
}

function ContactCard({ title, name, email, phone }: { title: string; name: string; email?: string; phone?: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{title}</p>
            <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-gray-400" />
                <span className="text-sm text-white font-medium">{name}</span>
            </div>
            {email && (
                <div className="flex items-center gap-2 mb-1">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{email}</span>
                </div>
            )}
            {phone && (
                <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{phone}</span>
                </div>
            )}
        </div>
    )
}
