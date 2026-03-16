'use client'

import Link from 'next/link'
import { ArrowRight, ArrowLeft, Upload, CheckCircle, User, FileText, Briefcase, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://rentguard.com'

const steps = [
    { id: 1, label: 'Personal Info', icon: User },
    { id: 2, label: 'Employment', icon: Briefcase },
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
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Social Security Number (Last 4) <span className="text-blue-400">*</span></label>
                <input name="ssn_last4" value={formData.ssn_last4} onChange={handleInputChange} placeholder="XXXX" required className="input-field" />
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
                <label className="text-sm font-medium text-gray-300">Years at Job</label>
                <input name="years_employed" type="number" value={formData.years_employed} onChange={handleInputChange} placeholder="3" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Monthly Gross Income (USD) <span className="text-blue-400">*</span></label>
                <input name="gross_income" type="number" value={formData.gross_income} onChange={handleInputChange} placeholder="8000" required className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-300">Other Monthly Income</label>
                <input name="other_income" type="number" value={formData.other_income} onChange={handleInputChange} placeholder="0" className="input-field" />
            </div>
        </div>
    )
}

function Step3Sub() {
    return (
        <div className="flex flex-col gap-5 text-left">
            {[
                { id: 'gov_id', label: 'Government ID', req: true },
                { id: 'paystub', label: 'Last 2 Pay Stubs', req: true },
                { id: 'bank3', label: 'Bank Statements', req: true },
            ].map((doc) => (
                <div key={doc.id} className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-medium text-gray-300">{doc.label} <span className="text-blue-400">*</span></label>
                    <label htmlFor={doc.id} className="flex items-center gap-3 w-full bg-white/5 border border-dashed border-white/15 rounded-xl px-4 py-4 text-sm text-gray-500 hover:border-blue-500/40 cursor-pointer transition-all">
                        <Upload size={16} className="text-blue-400" />
                        <span>Click to upload doc</span>
                        <input id={doc.id} type="file" className="hidden" />
                    </label>
                </div>
            ))}
            <div className="mt-2 flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <input type="checkbox" id="consent" required className="mt-0.5 accent-blue-500" />
                <label htmlFor="consent" className="text-xs text-gray-400 text-left leading-relaxed">
                    I authorize RentGuard to perform a <strong className="text-white">soft credit inquiry</strong> for underwriting. No affect to credit score.
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


    // Form data state
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '', dob: '', ssn_last4: '',
        employment_status: '', employer: '', job_title: '', years_employed: '', gross_income: '', other_income: ''
    })

    // Fetch parent application data if invited
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

    const handleNext = () => setStep((s) => Math.min(s + 1, 3))
    const handleBack = () => setStep((s) => Math.max(s - 1, 1))

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Upload Documents
            const docIds = ['gov_id', 'paystub', 'tax_return', 'bank3']
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

                            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }}>
                                {step === 1 && <Step1Sub formData={formData} handleInputChange={handleInputChange} />}
                                {step === 2 && <Step2Sub formData={formData} handleInputChange={handleInputChange} />}
                                {step === 3 && <Step3Sub />}

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
                                    Thank you! Your application has been received and is now under review by our underwriting team.
                                    You will receive an email with the final decision within <strong className="text-white">24&ndash;48 hours</strong>.
                                </p>
                            </div>

                            <div className="w-full max-w-sm bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                                <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">What Happens Next</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-blue-400">1</span>
                                        </div>
                                        <p className="text-xs text-gray-400">Our team reviews your data and documents</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-blue-400">2</span>
                                        </div>
                                        <p className="text-xs text-gray-400">An underwriter makes the final decision</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-blue-400">3</span>
                                        </div>
                                        <p className="text-xs text-gray-400">You receive an email with the result</p>
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
