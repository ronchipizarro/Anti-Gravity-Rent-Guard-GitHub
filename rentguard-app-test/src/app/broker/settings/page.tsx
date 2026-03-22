'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, LogOut } from 'lucide-react'
import { useBroker } from '@/components/broker/BrokerContext'
import { signOutBroker } from '@/lib/broker-auth'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
    const broker = useBroker()
    const router = useRouter()

    const [fullName, setFullName] = useState(broker.full_name)
    const [phone, setPhone] = useState(broker.phone || '')
    const [licenseId, setLicenseId] = useState(broker.license_id || '')
    const [brokerageName, setBrokerageName] = useState(broker.brokerage_name || '')
    const [brokerageLicense, setBrokerageLicense] = useState(broker.brokerage_license || '')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [profileLoading, setProfileLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [profileSuccess, setProfileSuccess] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')
    const [profileError, setProfileError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const handleProfileSave = async () => {
        setProfileError('')
        setProfileSuccess('')
        setProfileLoading(true)

        try {
            if (!supabase) throw new Error('Supabase not configured')
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            const res = await window.fetch('/api/broker/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    full_name: fullName,
                    phone: phone || null,
                    license_id: licenseId || null,
                    brokerage_name: brokerageName || null,
                    brokerage_license: brokerageLicense || null,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to update profile')
            }

            setProfileSuccess('Profile updated successfully!')
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setProfileError(err?.message || 'Something went wrong')
        } finally {
            setProfileLoading(false)
        }
    }

    const handlePasswordChange = async () => {
        setPasswordError('')
        setPasswordSuccess('')

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters')
            return
        }

        setPasswordLoading(true)
        try {
            if (!supabase) throw new Error('Supabase not configured')

            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error

            setPasswordSuccess('Password updated successfully!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setPasswordError(err?.message || 'Failed to update password')
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleSignOut = async () => {
        await signOutBroker()
        router.push('/broker/login')
    }

    return (
        <div className="pt-4 max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-1">Account Settings</h1>
            <p className="text-gray-500 text-sm mb-8">Manage your profile and preferences</p>

            {/* Profile Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
                {profileError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{profileError}</div>}
                {profileSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3 mb-4">{profileSuccess}</div>}

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <input type="email" value={broker.email} readOnly className="input-field opacity-60 cursor-not-allowed" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Phone</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">License ID</label>
                        <input type="text" value={licenseId} onChange={e => setLicenseId(e.target.value)} className="input-field" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Brokerage Name</label>
                        <input
                            type="text"
                            value={brokerageName}
                            onChange={e => setBrokerageName(e.target.value)}
                            readOnly={broker.role === 'realtor'}
                            className={`input-field ${broker.role === 'realtor' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                    </div>
                    {broker.role === 'broker' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Brokerage License</label>
                            <input type="text" value={brokerageLicense} onChange={e => setBrokerageLicense(e.target.value)} className="input-field" />
                        </div>
                    )}
                </div>

                <button onClick={handleProfileSave} disabled={profileLoading} className="mt-6 flex items-center gap-2 bg-white text-black font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm">
                    {profileLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <><Save size={16} /> Save Changes</>}
                </button>
            </div>

            {/* Password Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
                {passwordError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{passwordError}</div>}
                {passwordSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3 mb-4">{passwordSuccess}</div>}

                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className="input-field" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" />
                        </div>
                    </div>
                </div>

                <button onClick={handlePasswordChange} disabled={passwordLoading} className="mt-6 flex items-center gap-2 bg-white text-black font-semibold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm">
                    {passwordLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Update Password'}
                </button>
            </div>

            {/* Sign Out */}
            <div className="bg-white/5 border border-red-500/20 rounded-2xl p-8">
                <h2 className="text-lg font-semibold text-white mb-2">Sign Out</h2>
                <p className="text-gray-500 text-sm mb-4">Sign out of your RentGuard portal account</p>
                <button onClick={handleSignOut} className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 font-semibold py-2.5 px-6 rounded-xl hover:bg-red-500/20 transition-colors text-sm">
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </div>
    )
}
