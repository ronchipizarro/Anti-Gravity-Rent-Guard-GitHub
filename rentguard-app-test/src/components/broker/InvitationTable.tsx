'use client'

const statusBadge: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    sent: { label: 'Sent', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    accepted: { label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    declined: { label: 'Declined', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

interface Invitation {
    id: string
    renter_name: string
    renter_email: string
    role: string
    status: string
    sent_at: string | null
    created_at: string
    properties?: { address: string; city: string; state: string } | null
}

interface InvitationTableProps {
    invitations: Invitation[]
    showProperty?: boolean
}

export default function InvitationTable({ invitations, showProperty = true }: InvitationTableProps) {
    if (invitations.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <p className="text-gray-500 text-sm">No invitations yet</p>
            </div>
        )
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-4 py-3 text-gray-400 font-medium">Full Name</th>
                            <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                            {showProperty && <th className="text-left px-4 py-3 text-gray-400 font-medium">Property</th>}
                            <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                            <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                            <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invitations.map(inv => {
                            const badge = statusBadge[inv.status] || statusBadge.pending
                            return (
                                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/3">
                                    <td className="px-4 py-3 text-white font-medium">{inv.renter_name}</td>
                                    <td className="px-4 py-3 text-gray-400">{inv.renter_email}</td>
                                    {showProperty && (
                                        <td className="px-4 py-3 text-gray-400 truncate max-w-[200px]">
                                            {inv.properties ? `${inv.properties.address}, ${inv.properties.city}` : '—'}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-gray-400 capitalize">{inv.role.replace('_', ' ')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {new Date(inv.sent_at || inv.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
