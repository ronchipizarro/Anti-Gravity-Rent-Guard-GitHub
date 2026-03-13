'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, CheckCircle, Upload, FileText } from 'lucide-react'

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://rentguard.com'

export default function CosignerSubmitPage() {
    const params = useParams()
    const id = params.id as string

    const [app, setApp] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchApp = async () => {
            if (!supabase) { setError('Database not configured.'); setLoading(false); return }
            const { data, error: fetchError } = await supabase
                .from('applications').select('*').eq('id', id).single()
            if (fetchError || !data) { setError('Application not found.') }
            else { setApp(data) }
            setLoading(false)
        }
        fetchApp()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            // 1. Upload documents
            const docIds = ['cosigner_id', 'cosigner_paystub', 'cosigner_bank', 'cosigner_employment']
            const uploadedDocs: Record<string, string> = {}
            if (supabase) {
                for (const docId of docIds) {
                    const fileInput = document.getElementById(docId) as HTMLInputElement
                    if (fileInput?.files?.[0]) {
                        const file = fileInput.files[0]
                        const fileExt = file.name.split('.').pop()
                        const filePath = `cosigners/${id}/${docId}.${fileExt}`

                        const { error: uploadError } = await supabase.storage
                            .from('documents')
                            .upload(filePath, file)

                        if (!uploadError) uploadedDocs[docId] = filePath
                    }
                }
            }

            // 2. Call the cosigner submit API
            const res = await fetch('/api/cosigner/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: id, documents: uploadedDocs }),
            })
            const result = await res.json()

            if (result.success) {
                setSubmitted(true)
            } else {
                alert(result.error || 'Submission failed.')
            }
        } catch (err) {
            console.error(err)
            alert('Failed to submit documents.')
        } finally {
            setSubmitting(false)
        }
    }

    const cosignerName = app?.tenant_data?.cosigner
        ? `${app.tenant_data.cosigner.first_name || ''} ${app.tenant_data.cosigner.last_name || ''}`.trim()
        : ''

    const tenantName = app?.tenant_data
        ? `${app.tenant_data.first_name || ''} ${app.tenant_data.last_name || ''}`.trim()
        : ''

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
                    <a href={MARKETING_URL} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mb-6">
                        <ArrowLeft size={12} /> Back to Home
                    </a>

                    <div className="flex items-center gap-2 mb-4 p-2 pl-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium uppercase tracking-[0.1em] w-fit">
                        <FileText size={12} /> Cosigner Document Submission
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                        Submit Your Documents
                    </h1>
                    {cosignerName && (
                        <p className="text-gray-400 text-sm mb-2">
                            Hello <strong className="text-white">{cosignerName}</strong>, you have been listed as a cosigner for {tenantName || 'a RentGuard application'}.
                        </p>
                    )}
                    <p className="text-gray-500 text-sm mb-8">
                        Please upload the required documents below to complete the cosigner verification.
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
                                <h2 className="text-2xl font-bold text-white">Documents Submitted</h2>
                                <p className="text-gray-400 max-w-sm text-sm mt-3 mx-auto leading-relaxed">
                                    Thank you! Your documents have been submitted to the underwriting team for review. You will be notified of the final decision.
                                </p>
                            </div>
                            <a href={MARKETING_URL} className="btn-primary mt-4">Back to Home</a>
                        </div>
                    ) : (
                        <div className="glass-card">
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-5 text-left">
                                    {[
                                        { id: 'cosigner_id', label: 'Government-Issued Photo ID', req: true },
                                        { id: 'cosigner_paystub', label: 'Last 2 Pay Stubs (W-2)', req: true },
                                        { id: 'cosigner_bank', label: '3 Months Bank Statements', req: true },
                                        { id: 'cosigner_employment', label: 'Proof of Employment (W-2 or Employer Letter)', req: true },
                                    ].map((doc) => (
                                        <div key={doc.id} className="flex flex-col gap-1.5 text-left">
                                            <label className="text-sm font-medium text-gray-300">{doc.label} <span className="text-blue-400">*</span></label>
                                            <label htmlFor={doc.id} className="flex items-center gap-3 w-full bg-white/5 border border-dashed border-white/15 rounded-xl px-4 py-4 text-sm text-gray-500 hover:border-blue-500/40 cursor-pointer transition-all">
                                                <Upload size={16} className="text-blue-400" />
                                                <span>Click to upload</span>
                                                <input id={doc.id} type="file" className="hidden" />
                                            </label>
                                        </div>
                                    ))}

                                    <div className="mt-2 flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                                        <input type="checkbox" id="cosigner_consent" required className="mt-0.5 accent-blue-500" />
                                        <label htmlFor="cosigner_consent" className="text-xs text-gray-400 text-left leading-relaxed">
                                            I confirm that the information provided is accurate and I authorize RentGuard to verify my employment and financial details for underwriting purposes.
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/8 flex justify-end">
                                    <button type="submit" disabled={submitting} className="btn-primary gap-2 min-w-[180px]">
                                        {submitting ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Submit Documents <CheckCircle size={14} /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
