import { NextResponse } from 'next/server'
import { getBrokerFromRequest } from '@/lib/broker-api'

export async function GET(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth

    // Get broker IDs to query (self + children for brokers)
    const brokerIds = [broker.id]
    if (broker.role === 'broker') {
        const { data: children } = await sb
            .from('brokers')
            .select('id')
            .eq('parent_broker_id', broker.id)
        if (children) brokerIds.push(...children.map(c => c.id))
    }

    const { data, error } = await sb
        .from('applications')
        .select('*, properties(address, city, state, monthly_rent, property_type)')
        .in('broker_id', brokerIds)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}
