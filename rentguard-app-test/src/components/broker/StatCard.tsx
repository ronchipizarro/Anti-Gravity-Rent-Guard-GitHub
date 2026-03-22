'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
}

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon size={18} className="text-gray-400" />
                </div>
                <span className="text-sm text-gray-400">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    )
}
