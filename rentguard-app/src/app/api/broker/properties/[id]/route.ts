import { NextResponse } from 'next/server'
import { getBrokerFromRequest } from '@/lib/broker-api'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth

    const { data: property, error } = await sb
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error || !property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    // Check ownership (broker owns it or it belongs to a child realtor)
    if (property.broker_id !== broker.id) {
        if (broker.role === 'broker') {
            const { data: child } = await sb
                .from('brokers')
                .select('id')
                .eq('id', property.broker_id)
                .eq('parent_broker_id', broker.id)
                .single()
            if (!child) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    // Also fetch invitations for this property
    const { data: invitations } = await sb
        .from('invitations')
        .select('*')
        .eq('property_id', params.id)
        .order('created_at', { ascending: false })

    return NextResponse.json({ ...property, invitations: invitations || [] })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth
    const body = await request.json()

    const { data, error } = await sb
        .from('properties')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .eq('broker_id', broker.id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}
