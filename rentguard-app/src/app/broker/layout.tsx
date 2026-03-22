'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getBrokerSession, BrokerProfile } from '@/lib/broker-auth'
import BrokerSidebar from '@/components/broker/BrokerSidebar'
import { BrokerProvider } from '@/components/broker/BrokerContext'

const PUBLIC_PATHS = ['/broker/login', '/broker/register', '/broker/confirm']

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
    const [broker, setBroker] = useState<BrokerProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()
    const router = useRouter()

    const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p))

    useEffect(() => {
        async function checkAuth() {
            try {
                const result = await getBrokerSession()
                if (result) {
                    setBroker(result.broker)
                    if (isPublicPath) {
                        router.push('/broker/dashboard')
                    }
                } else if (!isPublicPath) {
                    router.push('/broker/login')
                }
            } catch {
                if (!isPublicPath) {
                    router.push('/broker/login')
                }
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    // Public pages (login/register) — no sidebar
    if (isPublicPath) {
        return <div className="min-h-screen bg-black">{children}</div>
    }

    // Protected pages — sidebar + main content
    if (!broker) return null

    return (
        <BrokerProvider broker={broker}>
            <div className="min-h-screen bg-black">
                <BrokerSidebar />
                <main className="lg:ml-64 min-h-screen">
                    <div className="max-w-6xl mx-auto px-6 pt-24 pb-8">
                        {children}
                    </div>
                </main>
            </div>
        </BrokerProvider>
    )
}
