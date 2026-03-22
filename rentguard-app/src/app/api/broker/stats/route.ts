import { NextResponse } from 'next/server'
import { getBrokerFromRequest } from '@/lib/broker-api'

export async function GET(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth

    const [propsRes, dealsRes, invRes] = await Promise.all([
        sb.from('properties').select('id', { count: 'exact', head: true }).eq('broker_id', broker.id),
        sb.from('applications').select('id', { count: 'exact', head: true }).eq('broker_id', broker.id),
        sb.from('invitations').select('id', { count: 'exact', head: true }).eq('broker_id', broker.id).in('status', ['pending', 'sent']),
    ])

    return NextResponse.json({
        properties: propsRes.count || 0,
        deals: dealsRes.count || 0,
        invitations: invRes.count || 0,
    })
}
