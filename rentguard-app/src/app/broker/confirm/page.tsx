'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function BrokerConfirmPage() {
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        async function handleConfirmation() {
            if (!supabase) {
                setErrorMsg('Supabase not configured')
                setStatus('error')
                return
            }

            // Supabase sends the tokens in the URL hash fragment
            // For PKCE flow (default in newer Supabase), it uses query params with code
            const hash = window.location.hash
            const params = new URLSearchParams(window.location.search)
            const code = params.get('code')

            if (code) {
                // PKCE flow — exchange the code for a session
                const { error } = await supabase.auth.exchangeCodeForSession(code)
                if (error) {
                    setErrorMsg(error.message)
                    setStatus('error')
                    return
                }
                // Sign out so user logs in fresh
                await supabase.auth.signOut()
                setStatus('success')
                return
            }

            if (hash) {
                // Implicit flow — tokens are in the hash
                const hashParams = new URLSearchParams(hash.substring(1))
                const accessToken = hashParams.get('access_token')
                const refreshToken = hashParams.get('refresh_token')
                const type = hashParams.get('type')

                if (accessToken && type === 'signup') {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    })
                    if (error) {
                        setErrorMsg(error.message)
                        setStatus('error')
                        return
                    }
                    // Sign out so user logs in fresh
                    await supabase.auth.signOut()
                    setStatus('success')
                    return
                }
            }

            // If we got here with no tokens/code, the confirmation may have already
            // been processed by Supabase automatically. Show success.
            setStatus('success')
        }

        handleConfirmation()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 size={48} className="text-white animate-spin mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-2">Confirming your email...</h1>
                        <p className="text-gray-400">Please wait a moment.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={32} className="text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Email confirmed!</h1>
                        <p className="text-gray-400 mb-8">
                            Your account is now active. You can sign in to the Broker Portal.
                        </p>
                        <Link
                            href="/broker/login"
                            className="inline-flex items-center gap-2 bg-white text-black font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Sign In
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
                            <XCircle size={32} className="text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Confirmation failed</h1>
                        <p className="text-gray-400 mb-2">
                            {errorMsg || 'Something went wrong while confirming your email.'}
                        </p>
                        <p className="text-gray-500 text-sm mb-8">
                            The link may have expired. Try registering again or contact support.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/broker/register"
                                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                Register Again
                            </Link>
                            <Link
                                href="/broker/login"
                                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-3 px-6"
                            >
                                Try Sign In
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
