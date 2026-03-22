'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signUpBroker, BrokerRole } from '@/lib/broker-auth'
import { Building2, User, Home, ArrowRight, Mail } from 'lucide-react'

const ROLES: { value: BrokerRole; label: string; description: string; icon: any }[] = [ // eslint-disable-line @typescript-eslint/no-explicit-any
    { value: 'broker', label: 'Broker', description: 'Manage your agency, invite realtors & tenants', icon: Building2 },
    { value: 'realtor', label: 'Realtor', description: 'List properties and invite tenants', icon: User },
    { value: 'owner', label: 'Property Owner', description: 'Enroll your properties for protection', icon: Home },
]

export default function BrokerRegisterPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const inviteToken = searchParams.get('invite')
    const inviteRole = searchParams.get('role') as BrokerRole | null
    const inviteBrokerage = searchParams.get('brokerage')

    const [role, setRole] = useState<BrokerRole>(inviteRole || 'broker')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [licenseId, setLicenseId] = useState('')
    const [brokerageName, setBrokerageName] = useState(inviteBrokerage || '')
    const [brokerageLicense, setBrokerageLicense] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [registered, setRegistered] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState('')

    useEffect(() => {
        if (inviteRole) setRole(inviteRole)
        if (inviteBrokerage) setBrokerageName(inviteBrokerage)
    }, [inviteRole, inviteBrokerage])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        try {
            await signUpBroker(email, password, {
                role,
                full_name: fullName,
                email,
                phone: phone || undefined,
                license_id: licenseId || undefined,
                brokerage_name: brokerageName || undefined,
                brokerage_license: brokerageLicense || undefined,
            })
            setRegisteredEmail(email)
            setRegistered(true)
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const showLicenseFields = role === 'broker' || role === 'realtor'

    if (registered) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
                        <Mail size={32} className="text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                    <p className="text-gray-400 mb-6">
                        We sent a confirmation link to{' '}
                        <span className="text-white font-medium">{registeredEmail}</span>.
                        Click the link in the email to activate your account.
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-500">
                        Didn&apos;t receive it? Check your spam folder or{' '}
                        <button
                            onClick={() => setRegistered(false)}
                            className="text-white hover:underline"
                        >
                            try again
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-6">
                        Already confirmed?{' '}
                        <Link href="/broker/login" className="text-white hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-4">
                        <span className="text-black font-black text-xl">R</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create your account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join RentGuard as a broker, realtor, or property owner</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                                {error}
                            </div>
                        )}

                        {/* Role Selection */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-3 block">I am a...</label>
                            <div className="grid grid-cols-3 gap-3">
                                {ROLES.map(r => {
                                    const Icon = r.icon
                                    const selected = role === r.value
                                    const locked = inviteRole && r.value !== inviteRole
                                    return (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => !locked && setRole(r.value)}
                                            disabled={!!locked}
                                            className={`p-4 rounded-xl border text-center transition-all ${selected
                                                ? 'bg-white text-black border-white'
                                                : locked
                                                    ? 'border-white/5 text-gray-600 cursor-not-allowed opacity-40'
                                                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                                }`}
                                        >
                                            <Icon size={24} className="mx-auto mb-2" />
                                            <p className="text-sm font-semibold">{r.label}</p>
                                            <p className={`text-[10px] mt-1 ${selected ? 'text-black/60' : 'text-gray-600'}`}>{r.description}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Common Fields */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-300">Full Name <span className="text-blue-400">*</span></label>
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Smith" required className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Email <span className="text-blue-400">*</span></label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Phone</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(305) 555-1234" className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Password <span className="text-blue-400">*</span></label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required className="input-field" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Confirm Password <span className="text-blue-400">*</span></label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required className="input-field" />
                            </div>
                        </div>

                        {/* License Fields (Broker/Realtor only) */}
                        {showLicenseFields && (
                            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">FL License ID</label>
                                    <input type="text" value={licenseId} onChange={e => setLicenseId(e.target.value)} placeholder="SL12345678" className="input-field" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-300">Brokerage Name</label>
                                    <input
                                        type="text"
                                        value={brokerageName}
                                        onChange={e => setBrokerageName(e.target.value)}
                                        placeholder="ABC Realty"
                                        readOnly={!!inviteBrokerage}
                                        className={`input-field ${inviteBrokerage ? 'opacity-60' : ''}`}
                                    />
                                </div>
                                {role === 'broker' && (
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-sm font-medium text-gray-300">Brokerage License</label>
                                        <input type="text" value={brokerageLicense} onChange={e => setBrokerageLicense(e.target.value)} placeholder="CQ12345678" className="input-field" />
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link href="/broker/login" className="text-white hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}
