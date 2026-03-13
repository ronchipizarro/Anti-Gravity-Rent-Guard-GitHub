'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, ArrowLeft, Upload, CheckCircle, Home, User, FileText, Copy, Mail, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://rentguard.com'

const steps = [
    { id: 1, label: 'Property Details', icon: Home },
    { id: 2, label: 'Tenant Info', icon: User },
    { id: 3, label: 'Documents', icon: FileText },
]

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-2 mb-10">
            {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${current >= s.id
                            ? 'bg-white text-black'
                            : 'border border-white/20 text-gray-500'
                            }`}
                    >
                        {current > s.id ? <CheckCircle size={14} /> : s.id}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${current >= s.id ? 'text-white' : 'text-gray-600'}`}>
                        {s.label}
                    </span>
                    {i < steps.length - 1 && (
                        <div className={`h-px w-8 md:w-16 mx-1 transition-colors duration-300 ${current > s.id ? 'bg-white/40' : 'bg-white/10'}`} />
                    )}
                </div>
            ))}
        </div>
    )
}

function Step1Sub({ formData, handleInputChange }: { formData: any, handleInputChange: (e: any) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-gray-300">Your Email (Owner/Broker) <span className="text-blue-400">*</span></label>
                <input name="owner_email" type="email" value={formData.owner_email} onChange={handleInputChange} placeholder="owner@email.com" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Property Address <span className="text-blue-400">*</span></label>
                <input name="property_address" value={formData.property_address} onChange={handleInputChange} placeholder="123 Main St" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">City <span className="text-blue-400">*</span></label>
                <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Los Angeles" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">State <span className="text-blue-400">*</span></label>
                <input name="state" value={formData.state} onChange={handleInputChange} placeholder="CA" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">ZIP Code <span className="text-blue-400">*</span></label>
                <input name="zip" value={formData.zip} onChange={handleInputChange} placeholder="90001" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Property Type <span className="text-blue-400">*</span></label>
                <select name="property_type" value={formData.property_type} onChange={handleInputChange} required className="input-field appearance-none px-4 text-white">
                    <option value="" className="bg-black">Select...</option>
                    <option value="SFH" className="bg-black">Single Family Home</option>
                    <option value="Condo" className="bg-black">Condo / Apartment</option>
                    <option value="Multi" className="bg-black">Multi-Family</option>
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Monthly Rent (USD) <span className="text-blue-400">*</span></label>
                <input name="monthly_rent" type="number" value={formData.monthly_rent} onChange={handleInputChange} placeholder="3000" required className="input-field" />
            </div>

            {/* Who pays the RentGuard protection fee */}
            <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                    Who pays the RentGuard protection fee? <span className="text-blue-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {(['owner', 'tenant'] as const).map((payer) => (
                        <button
                            key={payer}
                            type="button"
                            onClick={() => handleInputChange({ target: { name: 'fee_payer', value: payer } } as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                                formData.fee_payer === payer
                                    ? 'bg-blue-500/15 border-blue-500/50 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                formData.fee_payer === payer ? 'border-blue-400' : 'border-gray-600'
                            }`}>
                                {formData.fee_payer === payer && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                            </div>
                            <div>
                                <p className="text-sm font-medium capitalize">{payer}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">{payer === 'owner' ? 'You cover the fee' : 'Tenant covers the fee'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

function Step2Sub({ formData, handleInputChange }: { formData: any, handleInputChange: (e: any) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Tenant First Name <span className="text-blue-400">*</span></label>
                <input name="tenant_first" value={formData.tenant_first} onChange={handleInputChange} placeholder="Jane" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Tenant Last Name <span className="text-blue-400">*</span></label>
                <input name="tenant_last" value={formData.tenant_last} onChange={handleInputChange} placeholder="Doe" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Tenant Email <span className="text-blue-400">*</span></label>
                <input name="tenant_email" type="email" value={formData.tenant_email} onChange={handleInputChange} placeholder="jane@email.com" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Tenant Phone <span className="text-blue-400">*</span></label>
                <input name="tenant_phone" type="tel" value={formData.tenant_phone} onChange={handleInputChange} placeholder="+1 555 000 0000" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Employment <span className="text-blue-400">*</span></label>
                <select name="employment" value={formData.employment} onChange={handleInputChange} required className="input-field appearance-none px-4 text-white">
                    <option value="" className="bg-black">Select...</option>
                    <option value="W2" className="bg-black">Employed (W-2)</option>
                    <option value="1099" className="bg-black">Self-Employed / 1099</option>
                    <option value="Other" className="bg-black">Other</option>
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Monthly Gross Income <span className="text-blue-400">*</span></label>
                <input name="income" type="number" value={formData.income} onChange={handleInputChange} placeholder="8000" required className="input-field" />
            </div>
        </div>
    )
}

function Step3Sub({ inviteMode, setInviteMode, formData }: { inviteMode: boolean, setInviteMode: (v: boolean) => void, formData: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <div className="flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-medium">Tenant Invitation Mode</h3>
                        <p className="text-gray-500 text-xs mt-1">
                            Don&apos;t have the tenant&apos;s ID or pay stubs? Invite them to finish.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setInviteMode(!inviteMode)}
                        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${inviteMode ? 'bg-blue-600' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${inviteMode ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            {inviteMode ? (
                <div className="flex flex-col items-center py-8 px-4 text-center glass-card border-blue-500/20 bg-blue-500/5">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                        <Mail className="text-blue-400" size={20} />
                    </div>
                    <h4 className="text-white font-medium">We&apos;ll invite {formData.tenant_first || 'the tenant'}</h4>
                    <p className="text-gray-500 text-xs mt-2 max-w-xs leading-relaxed">
                        After you submit, we&apos;ll send a secure link to <strong className="text-gray-300">{formData.tenant_email || 'their email'}</strong>.
                        They can upload their own docs directly.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {[
                        { id: 'id_doc', label: 'Government ID', req: true },
                        { id: 'income_proof', label: 'Proof of Income', req: true },
                        { id: 'bank_statements', label: 'Bank Statements', req: true },
                        { id: 'lease_draft', label: 'Draft Lease', req: false },
                    ].map((doc) => (
                        <div key={doc.id} className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">{doc.label} {doc.req && <span className="text-blue-400">*</span>}</label>
                            <label htmlFor={doc.id} className="flex items-center gap-3 w-full bg-white/5 border border-dashed border-white/15 rounded-xl px-4 py-4 text-sm text-gray-500 hover:border-blue-500/40 cursor-pointer transition-all">
                                <Upload size={16} className="text-blue-400" />
                                <span>Click to upload doc</span>
                                <input id={doc.id} type="file" className="hidden" />
                            </label>
                        </div>
                    ))}
                </div>
            )}
            <p className="text-xs text-gray-600 mt-2">
                All documents are encrypted and stored securely. Only used for underwriting purposes.
            </p>
        </div>
    )
}

export default function OwnerApplyPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [inviteMode, setInviteMode] = useState(false)
    const [appId, setAppId] = useState('')
    const [copySuccess, setCopySuccess] = useState(false)

    // Form data state
    const [formData, setFormData] = useState({
        property_address: '', city: '', state: '', zip: '', property_type: '', monthly_rent: '',
        tenant_first: '', tenant_last: '', tenant_email: '', tenant_phone: '', employment: '', income: '',
        owner_email: '', fee_payer: 'owner'
    })

    const handleNext = () => setStep((s) => Math.min(s + 1, 3))
    const handleBack = () => setStep((s) => Math.max(s - 1, 1))

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleCopyLink = () => {
        const url = `${window.location.origin}/apply/tenant?appId=${appId}`
        navigator.clipboard.writeText(url)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const id = uuidv4()
            setAppId(id)

            // 1. Upload documents if not in invite mode
            const uploadedDocs: Record<string, string> = {}
            if (!inviteMode && supabase) {
                const docIds = ['id_doc', 'income_proof', 'bank_statements', 'lease_draft']
                for (const docId of docIds) {
                    const fileInput = document.getElementById(docId) as HTMLInputElement
                    if (fileInput?.files?.[0]) {
                        const file = fileInput.files[0]
                        const fileExt = file.name.split('.').pop()
                        const filePath = `${id}/${docId}.${fileExt}`

                        const { error: uploadError } = await supabase.storage
                            .from('documents')
                            .upload(filePath, file)

                        if (!uploadError) uploadedDocs[docId] = filePath
                    }
                }
            }

            // 2. Save to Supabase (Mocked if no credentials)
            if (supabase) {
                const { error: dbError } = await supabase
                    .from('applications')
                    .insert([{
                        id,
                        owner_data: {
                            email: formData.owner_email,
                            fee_payer: formData.fee_payer,
                            property: {
                                address: formData.property_address,
                                city: formData.city,
                                state: formData.state,
                                zip: formData.zip,
                                type: formData.property_type,
                                monthly_rent: formData.monthly_rent
                            },
                            tenant_preview: {
                                first_name: formData.tenant_first,
                                last_name: formData.tenant_last,
                                email: formData.tenant_email,
                                phone: formData.tenant_phone,
                                employment: formData.employment,
                                income: formData.income
                            }
                        },
                        status: inviteMode ? 'PENDING_TENANT' : 'SUBMITTED',
                        invite_only: inviteMode,
                        documents: uploadedDocs,
                        created_at: new Date().toISOString()
                    }])

                if (dbError) throw dbError
            } else {
                console.warn('Supabase not connected. Application simulated.')
                await new Promise(r => setTimeout(r, 1000))
            }

            // 3. Send invite email if in invite mode
            if (inviteMode) {
                try {
                    await fetch('/api/invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            applicationId: id,
                            tenantEmail: formData.tenant_email,
                            landlordEmail: formData.owner_email,
                            monthlyRent: formData.monthly_rent,
                            propertyAddress: formData.property_address,
                        }),
                    })
                } catch (emailErr) {
                    console.error('Failed to send invite email:', emailErr)
                }
            }

            setSubmitted(true)
        } catch (error) {
            console.error('Error submitting application:', error)
            alert('Something went wrong. Please check your Supabase credentials.')
        } finally {
            setLoading(false)
        }
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
                .input-field:focus {
                    outline: none;
                    border-color: rgba(59, 130, 246, 0.6);
                    background: rgba(255, 255, 255, 0.08);
                }
            `}</style>
            <div className="min-h-screen pt-10 pb-20 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <a href={MARKETING_URL} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mb-6">
                            <ArrowLeft size={12} /> Back to Home
                        </a>
                        <span className="section-label mb-2 block">Owner Application</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Protect Your Rental Income
                        </h1>
                        <p className="text-gray-400 text-sm mt-2">
                            Complete in under 10 minutes. Secure & encrypted.
                        </p>
                    </div>

                    {!submitted ? (
                        <div className="glass-card">
                            <StepIndicator current={step} />

                            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }}>
                                {step === 1 && <Step1Sub formData={formData} handleInputChange={handleInputChange} />}
                                {step === 2 && <Step2Sub formData={formData} handleInputChange={handleInputChange} />}
                                {step === 3 && <Step3Sub inviteMode={inviteMode} setInviteMode={setInviteMode} formData={formData} />}

                                {!supabase && (
                                    <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                                        <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Demo Mode Active</p>
                                            <p className="text-[11px] text-yellow-500/80 leading-relaxed mt-1">
                                                Supabase credentials missing in <code>.env.local</code>. Form will simulate success but won&apos;t save data.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/8">
                                    {step > 1 ? (
                                        <button type="button" onClick={handleBack} disabled={loading} className="btn-secondary gap-2">
                                            <ArrowLeft size={14} /> Back
                                        </button>
                                    ) : (
                                        <div />
                                    )}
                                    <button type="submit" disabled={loading} className="btn-primary gap-2 min-w-[140px]">
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : step < 3 ? (
                                            <>Next <ArrowRight size={14} /></>
                                        ) : (
                                            <>{inviteMode ? 'Send Invite' : 'Submit Application'} <CheckCircle size={14} /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="glass-card text-center flex flex-col items-center gap-6 py-12">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                                <CheckCircle size={28} className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {inviteMode ? 'Invitation Sent!' : 'Application Received!'}
                                </h2>
                                <p className="text-gray-400 max-w-sm text-sm leading-relaxed mt-2 mx-auto">
                                    {inviteMode
                                        ? `We've sent the application link to ${formData.tenant_email}. You can also share it manually below.`
                                        : "We've received your application and docs. We'll start underwriting immediately."}
                                </p>
                            </div>

                            {inviteMode && (
                                <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 mt-2">
                                    <div className="flex items-center justify-between gap-3 bg-black/40 border border-white/5 rounded-xl p-3">
                                        <span className="text-[10px] text-gray-500 font-mono truncate">
                                            .../apply/tenant?appId={appId}
                                        </span>
                                        <button
                                            onClick={handleCopyLink}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            {copySuccess ? (
                                                <><CheckCircle size={12} /> Copied</>
                                            ) : (
                                                <><Copy size={12} /> Copy Link</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <a href={MARKETING_URL} className="btn-primary mt-2">
                                Back to Home
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
