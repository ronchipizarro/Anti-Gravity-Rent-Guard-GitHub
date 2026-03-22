'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Home, Building, Building2, Store, Warehouse, Hotel, ArrowRight, ArrowLeft } from 'lucide-react'
import { useBroker } from '@/components/broker/BrokerContext'
import { supabase } from '@/lib/supabase'

const PROPERTY_TYPES = [
    { value: 'house', label: 'House', icon: Home },
    { value: 'townhome', label: 'Townhome', icon: Building },
    { value: 'apartment_condo', label: 'Apartment / Condo', icon: Building2 },
    { value: 'commercial', label: 'Commercial', icon: Store },
    { value: 'multi_family', label: 'Multi-Family', icon: Warehouse },
    { value: 'apartment_building', label: 'Apartment Building', icon: Hotel },
]

const LEASE_DURATIONS = [6, 12, 18, 24]

const steps = [
    { id: 1, label: 'Property Type' },
    { id: 2, label: 'Details' },
    { id: 3, label: 'Lease & Payment' },
    { id: 4, label: 'Owner Info' },
    { id: 5, label: 'Review' },
]

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-2 mb-10">
            {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${current >= s.id ? 'bg-white text-black' : 'border border-white/20 text-gray-500'}`}>
                        {current > s.id ? <CheckCircle size={14} /> : s.id}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${current >= s.id ? 'text-white' : 'text-gray-600'}`}>
                        {s.label}
                    </span>
                    {i < steps.length - 1 && (
                        <div className={`h-px w-4 md:w-8 mx-1 transition-colors duration-300 ${current > s.id ? 'bg-white/40' : 'bg-white/10'}`} />
                    )}
                </div>
            ))}
        </div>
    )
}

const initialForm = {
    property_type: '',
    address: '', city: 'Miami', state: 'FL', zip: '', floor: '', unit_number: '',
    bedrooms: '', monthly_rent: '', lease_duration_months: '12',
    lease_status: 'new', fee_payer: 'owner',
    is_llc: false, llc_name: '', llc_address: '', llc_rep_name: '', llc_rep_email: '',
    has_owner_info: false, owner_name: '', owner_email: '', owner_phone: '',
    is_broker_pm: false, has_pm: false, pm_name: '', pm_email: '', pm_will_sign: false,
}

export default function EnrollPropertyPage() {
    const broker = useBroker()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [form, setForm] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value })) // eslint-disable-line @typescript-eslint/no-explicit-any
    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(e.target.name, e.target.value)

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            if (!supabase) throw new Error('Supabase not configured')
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            const res = await fetch('/api/broker/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(form),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to enroll property')
            }

            router.push('/broker/properties')
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-4 max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-1">Enroll Property</h1>
            <p className="text-gray-500 text-sm mb-6">Add a new property to your RentGuard portfolio</p>

            <StepIndicator current={step} />

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                {/* Step 1 — Property Type */}
                {step === 1 && (
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">What type of property?</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {PROPERTY_TYPES.map(pt => {
                                const Icon = pt.icon
                                const selected = form.property_type === pt.value
                                return (
                                    <button
                                        key={pt.value}
                                        type="button"
                                        onClick={() => set('property_type', pt.value)}
                                        className={`p-4 rounded-xl border text-center transition-all ${selected ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                                    >
                                        <Icon size={28} className="mx-auto mb-2" />
                                        <p className="text-sm font-medium">{pt.label}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Step 2 — Property Details */}
                {step === 2 && (
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Property Details</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-300">Address <span className="text-blue-400">*</span></label>
                                <input name="address" value={form.address} onChange={handleInput} placeholder="123 Main St" required className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">City <span className="text-blue-400">*</span></label>
                                <input name="city" value={form.city} onChange={handleInput} className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">State</label>
                                <input name="state" value={form.state} onChange={handleInput} className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">ZIP Code <span className="text-blue-400">*</span></label>
                                <input name="zip" value={form.zip} onChange={handleInput} placeholder="33101" required className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Floor</label>
                                <input name="floor" value={form.floor} onChange={handleInput} placeholder="2" className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Unit Number</label>
                                <input name="unit_number" value={form.unit_number} onChange={handleInput} placeholder="4B" className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Bedrooms</label>
                                <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleInput} placeholder="2" className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Monthly Rent ($) <span className="text-blue-400">*</span></label>
                                <input name="monthly_rent" type="number" value={form.monthly_rent} onChange={handleInput} placeholder="3000" required className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Lease Duration</label>
                                <select name="lease_duration_months" value={form.lease_duration_months} onChange={handleInput} className="input-field appearance-none text-white">
                                    {LEASE_DURATIONS.map(d => (
                                        <option key={d} value={d} className="bg-black">{d} months</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 — Lease & Payment */}
                {step === 3 && (
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Lease & Payment</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-3 block">Lease Contract Status</label>
                                <div className="flex gap-3">
                                    {['new', 'ongoing'].map(v => (
                                        <button key={v} type="button" onClick={() => set('lease_status', v)}
                                            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.lease_status === v ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                            {v === 'new' ? 'New Contract' : 'Ongoing Contract'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-3 block">Who pays the RentGuard fee?</label>
                                <div className="flex gap-3">
                                    {['broker', 'owner', 'renter'].map(v => (
                                        <button key={v} type="button" onClick={() => set('fee_payer', v)}
                                            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ${form.fee_payer === v ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-3 block">Is this property owned by an LLC?</label>
                                <div className="flex gap-3 mb-4">
                                    {[true, false].map(v => (
                                        <button key={String(v)} type="button" onClick={() => set('is_llc', v)}
                                            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.is_llc === v ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                            {v ? 'Yes' : 'No'}
                                        </button>
                                    ))}
                                </div>
                                {form.is_llc && (
                                    <div className="grid sm:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-white/10">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-300">LLC Name</label>
                                            <input name="llc_name" value={form.llc_name} onChange={handleInput} placeholder="Property Holdings LLC" className="input-field" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-300">LLC Address</label>
                                            <input name="llc_address" value={form.llc_address} onChange={handleInput} placeholder="456 Business Ave" className="input-field" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-300">Representative Name</label>
                                            <input name="llc_rep_name" value={form.llc_rep_name} onChange={handleInput} className="input-field" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-300">Representative Email</label>
                                            <input name="llc_rep_email" type="email" value={form.llc_rep_email} onChange={handleInput} className="input-field" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 — Owner Information */}
                {step === 4 && (
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Owner Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-3 block">Do you have the owner&apos;s information?</label>
                                <div className="flex gap-3 mb-4">
                                    {[true, false].map(v => (
                                        <button key={String(v)} type="button" onClick={() => set('has_owner_info', v)}
                                            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.has_owner_info === v ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                            {v ? 'Yes' : 'No, add later'}
                                        </button>
                                    ))}
                                </div>
                                {form.has_owner_info && (
                                    <div className="grid sm:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-white/10">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-300">Owner Name</label>
                                            <input name="owner_name" value={form.owner_name} onChange={handleInput} className="input-field" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-300">Owner Email</label>
                                            <input name="owner_email" type="email" value={form.owner_email} onChange={handleInput} className="input-field" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-300">Owner Phone</label>
                                            <input name="owner_phone" type="tel" value={form.owner_phone} onChange={handleInput} className="input-field" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-3 block">Are you the property manager?</label>
                                <div className="flex gap-3 mb-4">
                                    {[true, false].map(v => (
                                        <button key={String(v)} type="button" onClick={() => set('is_broker_pm', v)}
                                            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.is_broker_pm === v ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                            {v ? 'Yes' : 'No'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {!form.is_broker_pm && (
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-3 block">Does this property have a property manager?</label>
                                    <div className="flex gap-3 mb-4">
                                        {[true, false].map(v => (
                                            <button key={String(v)} type="button" onClick={() => set('has_pm', v)}
                                                className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.has_pm === v ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                                {v ? 'Yes' : 'No'}
                                            </button>
                                        ))}
                                    </div>
                                    {form.has_pm && (
                                        <div className="grid sm:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-white/10">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-medium text-gray-300">PM Name</label>
                                                <input name="pm_name" value={form.pm_name} onChange={handleInput} className="input-field" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-medium text-gray-300">PM Email</label>
                                                <input name="pm_email" type="email" value={form.pm_email} onChange={handleInput} className="input-field" />
                                            </div>
                                            <div className="flex items-center gap-3 sm:col-span-2">
                                                <input type="checkbox" id="pm_will_sign" checked={form.pm_will_sign} onChange={e => set('pm_will_sign', e.target.checked)} className="w-4 h-4 rounded" />
                                                <label htmlFor="pm_will_sign" className="text-sm text-gray-300">Property manager will sign on behalf of the owner</label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 5 — Review & Submit */}
                {step === 5 && (
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Review & Submit</h2>
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-xl p-5 space-y-3">
                                <Row label="Property Type" value={PROPERTY_TYPES.find(p => p.value === form.property_type)?.label || form.property_type} />
                                <Row label="Address" value={`${form.address}, ${form.city}, ${form.state} ${form.zip}`} />
                                {form.floor && <Row label="Floor / Unit" value={`${form.floor}${form.unit_number ? ` / ${form.unit_number}` : ''}`} />}
                                {form.bedrooms && <Row label="Bedrooms" value={form.bedrooms} />}
                                <Row label="Monthly Rent" value={`$${Number(form.monthly_rent).toLocaleString()}`} />
                                <Row label="Lease Duration" value={`${form.lease_duration_months} months`} />
                                <Row label="Lease Status" value={form.lease_status === 'new' ? 'New Contract' : 'Ongoing Contract'} />
                                <Row label="Fee Payer" value={form.fee_payer.charAt(0).toUpperCase() + form.fee_payer.slice(1)} />
                                {form.is_llc && <Row label="LLC" value={form.llc_name || 'Yes'} />}
                                {form.has_owner_info && <Row label="Owner" value={form.owner_name || 'Provided'} />}
                                <Row label="Property Manager" value={form.is_broker_pm ? 'You (broker)' : form.has_pm ? form.pm_name || 'Provided' : 'None'} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    {step > 1 ? (
                        <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                            <ArrowLeft size={16} /> Back
                        </button>
                    ) : <div />}
                    {step < 5 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 && !form.property_type}
                            className="flex items-center gap-2 bg-white text-black font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 bg-white text-black font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>Enroll My Property <CheckCircle size={16} /></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function Row({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-400">{label}</span>
            <span className="text-white font-medium">{value}</span>
        </div>
    )
}
