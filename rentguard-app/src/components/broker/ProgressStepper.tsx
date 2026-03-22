'use client'

import { CheckCircle } from 'lucide-react'

const STAGES = [
    { key: 'enrolled', label: 'Enrolled' },
    { key: 'invitations_sent', label: 'Invitations Sent' },
    { key: 'tenant_applied', label: 'Tenant Applied' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'active', label: 'Active' },
]

const STATUS_ORDER: Record<string, number> = {
    enrolled: 0,
    invitations_sent: 1,
    tenant_applied: 2,
    under_review: 3,
    approved: 3,
    contract_sent: 4,
    contract_signed: 4,
    payment_pending: 4,
    active: 4,
    rejected: -1,
}

export default function ProgressStepper({ status }: { status: string }) {
    const currentIndex = STATUS_ORDER[status] ?? 0

    return (
        <div className="flex items-center w-full">
            {STAGES.map((stage, i) => {
                const completed = i < currentIndex
                const active = i === currentIndex
                return (
                    <div key={stage.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${completed ? 'bg-emerald-500 text-white' : active ? 'bg-white text-black' : 'border border-white/20 text-gray-500'}`}>
                                {completed ? <CheckCircle size={14} /> : i + 1}
                            </div>
                            <span className={`text-[10px] mt-2 text-center max-w-[80px] ${completed || active ? 'text-white' : 'text-gray-600'}`}>
                                {stage.label}
                            </span>
                        </div>
                        {i < STAGES.length - 1 && (
                            <div className={`h-px flex-1 mx-2 ${completed ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
