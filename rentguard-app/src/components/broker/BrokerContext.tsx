'use client'

import { createContext, useContext } from 'react'
import { BrokerProfile } from '@/lib/broker-auth'

interface BrokerContextType {
    broker: BrokerProfile
}

const BrokerContext = createContext<BrokerContextType | null>(null)

export function BrokerProvider({ broker, children }: { broker: BrokerProfile; children: React.ReactNode }) {
    return (
        <BrokerContext.Provider value={{ broker }}>
            {children}
        </BrokerContext.Provider>
    )
}

export function useBroker(): BrokerProfile {
    const ctx = useContext(BrokerContext)
    if (!ctx) throw new Error('useBroker must be used within BrokerProvider')
    return ctx.broker
}
