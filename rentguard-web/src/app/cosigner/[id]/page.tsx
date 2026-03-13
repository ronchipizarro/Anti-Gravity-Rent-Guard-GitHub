'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, UserPlus, AlertTriangle } from 'lucide-react'

export default function CosignerPage() {
    const params = useParams()
    const id = params.id as string

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState<any>({ // eslint-disable-line @typescript-eslint/no-explicit-any
        first_name: '', last_name: '', email: '', phone: '',
        employer: '', job_title: '', years_employed: '', gross_income: '',
        relationship: ''
    })

    useEffect(() => {
        const fetchApp = async () => {
            if (!supabase) { setError('Database not configured.'); setLoading(false); return }
            const { data, error: fetchError } = await supabase
                .from('applications').select('*').eq('id', id).single()
            if (fetchError || !data) { setError('Application not found.') }
            else { /* app data is unused for now */ }
            setLoading(false)
        }
        fetchApp()
    }, [id])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/cosigner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: id, cosignerData: formData }),
            })
            const result = await res.json()
            if (result.success) {
                setSubmitted(true)
            } else {
                alert(result.error || 'Submission failed.')
            }
        } catch (err) {
            console.error(err)
            alert('Failed to submit cosigner details.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Navbar />
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
            <main className="min-h-screen pt-24 pb-20 px-6">
                <div className="max-w-2xl mx-auto">
                    <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mb-6">
                        <ArrowLeft size={12} /> Back to Home
                    </Link>

                    <div className="flex items-center gap-2 mb-4 p-2 pl-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-medium uppercase tracking-[0.1em] w-fit">
                        <AlertTriangle size={12} /> Cosigner Required
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                        Add a Cosigner
                    </h1>
                    <p className="text-gray-400 text-sm mb-8">
                        Your application requires a cosigner to proceed. Please provide their details below. They will receive an email to submit their documentation.
                    </p>

                    {loading ? (
                        <div className="glass-card flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="glass-card text-center py-16">
                            <p className="text-gray-400">{error}</p>
                        </div>
                    ) : submitted ? (
                        <div className="glass-card text-center flex flex-col items-center gap-6 py-12">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                                <CheckCircle size={28} className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Cosigner Details Submitted</h2>
                                <p className="text-gray-400 max-w-sm text-sm mt-3 mx-auto leading-relaxed">
                                    We&apos;ve sent an email to <strong className="text-white">{formData.email}</strong> with instructions to submit their documentation.
                                </p>
                            </div>
                            <Link href="/" className="btn-primary mt-4">Back to Home</Link>
                        </div>
                    ) : (
                        <div className="glass-card">
                            {/* Requirements Banner */}
                            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 mb-8">
                                <h3 className="text-sm font-semibold text-yellow-400 mb-2">Cosigner Requirements</h3>
                                <ul className="text-xs text-gray-400 space-y-1">
                                    <li>• W-2 employment</li>
                                    <li>• More than 6 months at their current job</li>
                                    <li>• At least 3× income-to-rent ratio</li>
                                </ul>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid sm:grid-cols-2 gap-5 text-left">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">First Name <span className="text-blue-400">*</span></label>
                                        <input name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="John" required className="input-field" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">Last Name <span className="text-blue-400">*</span></label>
                                        <input name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Smith" required className="input-field" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">Email Address <span className="text-blue-400">*</span></label>
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@email.com" required className="input-field" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">Phone Number <span className="text-blue-400">*</span></label>
                                        <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+1 555 000 0000" required className="input-field" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">Employer <span className="text-blue-400">*</span></label>
                                        <input name="employer" value={formData.employer} onChange={handleInputChange} placeholder="Acme Corp" required className="input-field" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">Job Title <span className="text-blue-400">*</span></label>
                                        <input name="job_title" value={formData.job_title} onChange={handleInputChange} placeholder="Manager" required className="input-field" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">Years at Job <span className="text-blue-400">*</span></label>
                                        <input name="years_employed" type="number" value={formData.years_employed} onChange={handleInputChange} placeholder="3" required className="input-field" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-300">Monthly Gross Income (USD) <span className="text-blue-400">*</span></label>
                                        <input name="gross_income" type="number" value={formData.gross_income} onChange={handleInputChange} placeholder="10000" required className="input-field" />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-sm font-medium text-gray-300">Relationship to Tenant <span className="text-blue-400">*</span></label>
                                        <select name="relationship" value={formData.relationship} onChange={handleInputChange} required className="input-field appearance-none px-4 text-white">
                                            <option value="" className="bg-black">Select...</option>
                                            <option value="Parent" className="bg-black">Parent</option>
                                            <option value="Sibling" className="bg-black">Sibling</option>
                                            <option value="Spouse" className="bg-black">Spouse / Partner</option>
                                            <option value="Friend" className="bg-black">Friend</option>
                                            <option value="Other" className="bg-black">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/8 flex justify-end">
                                    <button type="submit" disabled={submitting} className="btn-primary gap-2 min-w-[180px]">
                                        {submitting ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Submit Cosigner <UserPlus size={14} /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}
