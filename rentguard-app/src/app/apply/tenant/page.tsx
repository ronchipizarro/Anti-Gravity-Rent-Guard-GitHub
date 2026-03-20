'use client'

import Link from 'next/link'
import { ArrowRight, ArrowLeft, Upload, CheckCircle, User, FileText, Briefcase, AlertTriangle, ShieldCheck, Info } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://rentguard.com'

const CREDIT_SCORE_OPTIONS = [
    { value: 'unknown', label: "I don't know my credit score" },
    { value: '300', label: '300 – Poor' },
    { value: '350', label: '350 – Poor' },
    { value: '400', label: '400 – Poor' },
    { value: '450', label: '450 – Poor' },
    { value: '500', label: '500 – Fair' },
    { value: '550', label: '550 – Fair' },
    { value: '600', label: '600 – Fair' },
    { value: '650', label: '650 – Good' },
    { value: '700', label: '700 – Good' },
    { value: '750', label: '750 – Very Good' },
    { value: '800', label: '800 – Exceptional' },
    { value: '850', label: '850 – Exceptional' },
]

const steps = [
    { id: 1, label: 'Personal Info', icon: User },
    { id: 2, label: 'Employment', icon: Briefcase },
    { id: 3, label: 'Documents', icon: FileText },
    { id: 4, label: 'Agreement', icon: ShieldCheck },
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

function SsnInput({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
        let formatted = raw
        if (raw.length > 5) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5)}`
        else if (raw.length > 3) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`
        onChange({ ...e, target: { ...e.target, name: 'ssn', value: formatted } } as React.ChangeEvent<HTMLInputElement>)
    }
    return (
        <input
            name="ssn"
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
            required
            className="input-field"
            autoComplete="off"
        />
    )
}

function Step1Sub({ formData, handleInputChange }: { formData: any, handleInputChange: (e: any) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <div className="grid sm:grid-cols-2 gap-5 text-left">
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300 text-left">First Name <span className="text-blue-400">*</span></label>
                <input name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Jane" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Last Name <span className="text-blue-400">*</span></label>
                <input name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Doe" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Email Address <span className="text-blue-400">*</span></label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="jane@email.com" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Phone Number <span className="text-blue-400">*</span></label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+1 555 000 0000" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Date of Birth <span className="text-blue-400">*</span></label>
                <input name="dob" type="date" value={formData.dob} onChange={handleInputChange} required className="input-field" />
            </div>

            {/* Full SSN */}
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Social Security Number <span className="text-blue-400">*</span></label>
                <SsnInput value={formData.ssn} onChange={handleInputChange} />
                <p className="text-[10px] text-gray-500 leading-relaxed">Your SSN is encrypted and used solely for identity verification and credit assessment.</p>
            </div>

            {/* Credit Score */}
            <div className="flex flex-col gap-1.5 text-left sm:col-span-2">
                <label className="text-sm font-medium text-gray-300">Estimated Credit Score <span className="text-blue-400">*</span></label>
                <select name="credit_score" value={formData.credit_score} onChange={handleInputChange} required className="input-field appearance-none px-4 text-white">
                    <option value="" className="bg-black">Select your estimated credit score...</option>
                    {CREDIT_SCORE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
                    ))}
                </select>
                <p className="text-[10px] text-gray-500 leading-relaxed flex items-center gap-1">
                    <Info size={10} className="flex-shrink-0" /> If you&apos;re unsure, select &ldquo;I don&apos;t know&rdquo; — our underwriter will review manually.
                </p>
            </div>

            {/* Prior Eviction History */}
            <div className="flex flex-col gap-2 text-left sm:col-span-2">
                <label className="text-sm font-medium text-gray-300">Have you ever been evicted? <span className="text-blue-400">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                    {(['no', 'yes'] as const).map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => handleInputChange({ target: { name: 'eviction_history', value: val } })}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                                formData.eviction_history === val
                                    ? val === 'no'
                                        ? 'bg-green-500/15 border-green-500/50 text-white'
                                        : 'bg-red-500/15 border-red-500/50 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                formData.eviction_history === val
                                    ? val === 'no' ? 'border-green-400' : 'border-red-400'
                                    : 'border-gray-600'
                            }`}>
                                {formData.eviction_history === val && (
                                    <div className={`w-2 h-2 rounded-full ${val === 'no' ? 'bg-green-400' : 'bg-red-400'}`} />
                                )}
                            </div>
                            <span className="text-sm font-medium capitalize">{val === 'no' ? 'No, never' : 'Yes'}</span>
                        </button>
                    ))}
                </div>

                {formData.eviction_history === 'yes' && (
                    <div className="flex flex-col gap-1.5 mt-1">
                        <label className="text-xs font-medium text-gray-400">Please explain the circumstances <span className="text-blue-400">*</span></label>
                        <textarea
                            name="eviction_explanation"
                            value={formData.eviction_explanation}
                            onChange={handleInputChange}
                            placeholder="Briefly describe the situation (year, reason, outcome)..."
                            rows={3}
                            required
                            className="input-field resize-none"
                        />
                        <p className="text-[10px] text-yellow-500/80 flex items-start gap-1">
                            <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" /> Applications with eviction history will be individually reviewed by an underwriter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function Step2Sub({ formData, handleInputChange }: { formData: any, handleInputChange: (e: any) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <div className="grid sm:grid-cols-2 gap-5 text-left">
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Employment Status <span className="text-blue-400">*</span></label>
                <select name="employment_status" value={formData.employment_status} onChange={handleInputChange} required className="input-field appearance-none px-4 text-white">
                    <option value="" className="bg-black">Select...</option>
                    <option value="Employed (W-2)" className="bg-black">Employed (W-2)</option>
                    <option value="Self-Employed / 1099" className="bg-black">Self-Employed / 1099</option>
                    <option value="Retired" className="bg-black">Retired</option>
                    <option value="Other" className="bg-black">Other</option>
                </select>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Employer Name</label>
                <input name="employer" value={formData.employer} onChange={handleInputChange} placeholder="Acme Corp" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Job Title</label>
                <input name="job_title" value={formData.job_title} onChange={handleInputChange} placeholder="Engineer" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Years at Current Job / Business</label>
                <input name="years_employed" type="number" min="0" max="50" value={formData.years_employed} onChange={handleInputChange} placeholder="3" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Monthly Gross Income (USD) <span className="text-blue-400">*</span></label>
                <input name="gross_income" type="number" min="0" value={formData.gross_income} onChange={handleInputChange} placeholder="8000" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Other Monthly Income (USD)</label>
                <input name="other_income" type="number" min="0" value={formData.other_income} onChange={handleInputChange} placeholder="0" className="input-field" />
            </div>
        </div>
    )
}

function Step3Sub({ uploadedFiles, onFileChange }: { uploadedFiles: Record<string, { name: string; size: number }>; onFileChange: (docId: string, file: File | null) => void }) {
    const docs = [
        { id: 'photo_id', label: 'Government Photo ID', hint: 'Driver\'s license, passport, or state ID', req: true },
        { id: 'employment_doc', label: 'Employment Document', hint: 'Pay stub, tax return, or employment letter', req: true },
        { id: 'bank3', label: 'Bank Statements (Last 3 Months)', hint: 'Any account showing your income deposits', req: true },
    ]

    return (
        <div className="flex flex-col gap-5 text-left">
            {docs.map((doc) => (
                <div key={doc.id} className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-medium text-gray-300">
                        {doc.label} {doc.req && <span className="text-blue-400">*</span>}
                    </label>
                    {doc.hint && <p className="text-[11px] text-gray-500 -mt-0.5">{doc.hint}</p>}
                    <label htmlFor={doc.id} className={`flex items-center gap-3 w-full border border-dashed rounded-xl px-4 py-4 text-sm cursor-pointer transition-all ${uploadedFiles[doc.id] ? 'bg-green-500/5 border-green-500/30 text-green-400' : 'bg-white/5 border-white/15 text-gray-500 hover:border-blue-500/40'}`}>
                        {uploadedFiles[doc.id] ? (
                            <CheckCircle size={16} className="text-green-400" />
                        ) : (
                            <Upload size={16} className="text-blue-400" />
                        )}
                        <span className="flex-1 truncate">
                            {uploadedFiles[doc.id] ? uploadedFiles[doc.id].name : 'Click to upload (PDF, JPG, PNG)'}
                        </span>
                        {uploadedFiles[doc.id] && (
                            <span className="text-xs text-gray-500 flex-shrink-0">
                                {(uploadedFiles[doc.id].size / 1024).toFixed(1)} KB
                            </span>
                        )}
                        <input
                            id={doc.id}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                onFileChange(doc.id, file)
                            }}
                        />
                    </label>
                </div>
            ))}

            {/* FCRA Disclosure */}
            <div className="mt-2 flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <input type="checkbox" id="fcra_consent" name="fcra_consent" required className="mt-0.5 accent-blue-500" />
                <label htmlFor="fcra_consent" className="text-xs text-gray-400 text-left leading-relaxed">
                    <strong className="text-white">FCRA Authorization:</strong> I hereby authorize RentGuard to obtain a consumer credit report in connection with this rental application, as permitted under the Fair Credit Reporting Act (FCRA). I understand this may be a hard or soft inquiry depending on underwriting requirements and may have a minimal effect on my credit score. I certify that all information provided in this application is true and accurate.{' '}
                    <span className="text-blue-400">*</span>
                </label>
            </div>
        </div>
    )
}

function Step4Sub({ formData, handleInputChange }: { formData: any, handleInputChange: (e: any) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <div className="flex flex-col gap-6 text-left">
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 mb-2">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-400" /> Rent Protection Services Agreement
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    As part of your application, you must agree to the Rent Guard Protection terms. This tri-party agreement between you, the Landlord, and Rent Guard ensures rent continuity and expedited resolution.
                </p>
                
                <div className="space-y-3 mb-6">
                    {[
                        { t: 'Automatic 3-Day Notice', d: 'You authorize Rent Guard to serve legal notice on day 1 of any missed payment.' },
                        { t: 'Expedited Eviction', d: 'You waive certain procedural delays to allow for the Florida Summary Procedure.' },
                        { t: 'Power of Attorney', d: 'The Landlord grants Rent Guard full authority to manage Lease enforcement.' },
                        { t: 'Direct Collection', d: 'You remain liable for all unpaid rent and collection costs directly to Rent Guard.' },
                    ].map((point) => (
                        <div key={point.t} className="flex gap-3">
                            <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-gray-200">{point.t}</p>
                                <p className="text-[10px] text-gray-500">{point.d}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Alternative Contact Info */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider text-left">Alternative Contact Address <span className="text-blue-400">*</span></label>
                        <input name="alternative_address" value={formData.alternative_address} onChange={handleInputChange} placeholder="Emergency / Family Address" required className="input-field py-2 text-xs" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider text-left">Alternative Contact Email <span className="text-blue-400">*</span></label>
                        <input name="alternative_email" type="email" value={formData.alternative_email} onChange={handleInputChange} placeholder="family@email.com" required className="input-field py-2 text-xs" />
                    </div>
                </div>
            </div>

            {/* Agreement Consent */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input type="checkbox" id="legal_consent" name="legal_consent" required className="mt-0.5 accent-blue-500" />
                <label htmlFor="legal_consent" className="text-xs text-gray-400 text-left leading-relaxed text-left">
                    I have read, understood, and hereby agree to be bound by the <strong className="text-white">Rent Protection Services Agreement</strong>. I acknowledge the alternative contact information provided is accurate and authorize Rent Guard to contact these parties solely for location purposes in the event of default. <span className="text-blue-400">*</span>
                </label>
            </div>
        </div>
    )
}

function TenantApplyContent() {
    const searchParams = useSearchParams()
    const appId = searchParams.get('appId') || ''

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [appData, setAppData] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

    const [formData, setFormData] = useState({
        // Step 1
        first_name: '', last_name: '', email: '', phone: '', dob: '',
        ssn: '',
        credit_score: '',
        eviction_history: '',
        eviction_explanation: '',
        // Step 2
        employment_status: '', employer: '', job_title: '', years_employed: '', gross_income: '', other_income: '',
        // Step 4
        alternative_address: '',
        alternative_email: '',
    })

    const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: number }>>({})

    const handleFileChange = (docId: string, file: File | null) => {
        if (file) {
            setUploadedFiles(prev => ({ ...prev, [docId]: { name: file.name, size: file.size } }))
        } else {
            setUploadedFiles(prev => {
                const next = { ...prev }
                delete next[docId]
                return next
            })
        }
    }

    useEffect(() => {
        if (appId) {
            const fetchApp = async () => {
                if (!supabase) return
                const { data, error } = await supabase
                    .from('applications')
                    .select('*')
                    .eq('id', appId)
                    .single()
                if (data && !error) setAppData(data)
            }
            fetchApp()
        }
    }, [appId])

    const handleNext = () => {
        // Validate step 1 required fields before advancing
        if (step === 1) {
            if (!formData.eviction_history) {
                alert('Please indicate whether you have been evicted.')
                return
            }
            if (formData.eviction_history === 'yes' && !formData.eviction_explanation.trim()) {
                alert('Please explain the eviction circumstances.')
                return
            }
        }
        setStep((s) => Math.min(s + 1, 4))
    }
    const handleBack = () => setStep((s) => Math.max(s - 1, 1))

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Upload Documents
            const docIds = ['photo_id', 'employment_doc', 'bank3']
            const uploadedDocs: Record<string, string> = {}
            const effectiveAppId = appId || 'direct-' + Date.now()
            if (supabase) {
                for (const docId of docIds) {
                    const fileInput = document.getElementById(docId) as HTMLInputElement
                    if (fileInput?.files?.[0]) {
                        const file = fileInput.files[0]
                        const fileExt = file.name.split('.').pop()
                        const filePath = `tenants/${effectiveAppId}/${docId}.${fileExt}`
                        const { error: uploadError } = await supabase.storage
                            .from('documents')
                            .upload(filePath, file)
                        if (!uploadError) uploadedDocs[docId] = filePath
                    }
                }
            }

            // 2. If no appId (direct tenant), create the record first
            let resolvedAppId = appId
            if (!resolvedAppId && supabase) {
                const { data: newApp, error: insertErr } = await supabase
                    .from('applications')
                    .insert([{
                        tenant_data: { ...formData, documents: uploadedDocs },
                        status: 'SUBMITTED',
                        documents: uploadedDocs
                    }])
                    .select()
                    .single()
                if (insertErr) throw insertErr
                resolvedAppId = newApp.id
            }

            // 3. Call the submit API (runs underwriting + sends emails)
            const ownerEmail = appData?.owner_data?.email || appData?.owner_data?.tenant_preview?.email || ''
            const res = await fetch('/api/apply/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId: resolvedAppId,
                    tenantData: { ...formData, documents: uploadedDocs },
                    ownerEmail,
                }),
            })
            const result = await res.json()
            if (!result.success) throw new Error(result.error || 'Submission failed')

            setSubmitted(true)
        } catch (error) {
            console.error('Error submitting application:', error)
            alert('Submission failed. Please try again.')
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
                    text-align: left;
                }
                .input-field:focus {
                    outline: none;
                    border-color: rgba(59, 130, 246, 0.6);
                    background: rgba(255, 255, 255, 0.08);
                }
                select.input-field option {
                    background: #000;
                    color: white;
                }
            `}</style>
            <div className="min-h-screen pt-24 pb-20 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <a href={MARKETING_URL} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mb-6">
                            <ArrowLeft size={12} /> Back to Home
                        </a>
                        {appId && (
                            <div className="flex items-center gap-2 mb-4 p-2 pl-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium uppercase tracking-[0.1em] w-fit">
                                <ShieldCheck size={12} /> Linked to Invite #{appId.slice(0, 8)}
                            </div>
                        )}
                        <span className="section-label mb-2 block">Tenant Application</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Get RentGuard Approved
                        </h1>
                    </div>

                    {!submitted ? (
                        <div className="glass-card">
                            <StepIndicator current={step} />

                            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }}>
                                {step === 1 && <Step1Sub formData={formData} handleInputChange={handleInputChange} />}
                                {step === 2 && <Step2Sub formData={formData} handleInputChange={handleInputChange} />}
                                {step === 3 && <Step3Sub uploadedFiles={uploadedFiles} onFileChange={handleFileChange} />}
                                {step === 4 && <Step4Sub formData={formData} handleInputChange={handleInputChange} />}

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
                                        ) : step < 4 ? (
                                            <>Next <ArrowRight size={14} /></>
                                        ) : (
                                            <>Complete Application <CheckCircle size={14} /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="glass-card text-center flex flex-col items-center gap-6 py-12">
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                                <CheckCircle size={28} className="text-blue-400" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Application Submitted
                                </h2>
                                <p className="text-gray-400 max-w-sm text-sm mt-3 mx-auto leading-relaxed">
                                    Thank you! Your application is being reviewed. You will receive a <strong className="text-white">pre-approval decision shortly</strong> by email, followed by final confirmation from our underwriting team.
                                </p>
                            </div>

                            <div className="w-full max-w-sm bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                                <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">What Happens Next</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-blue-400">1</span>
                                        </div>
                                        <p className="text-xs text-gray-400">Our system evaluates your application automatically</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-blue-400">2</span>
                                        </div>
                                        <p className="text-xs text-gray-400">You receive a pre-approval result by email</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-blue-400">3</span>
                                        </div>
                                        <p className="text-xs text-gray-400">An underwriter does a final review and activates your coverage</p>
                                    </div>
                                </div>
                            </div>

                            <a href={MARKETING_URL} className="btn-primary mt-4">
                                Back to Home
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default function TenantApplyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <TenantApplyContent />
        </Suspense>
    )
}
