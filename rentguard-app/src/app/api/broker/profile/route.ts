import { NextResponse } from 'next/server'
import { getBrokerFromRequest } from '@/lib/broker-api'

export async function GET(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(auth.broker)
}

export async function PATCH(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth
    const body = await request.json()

    // Only allow updating specific fields
    const allowedFields: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any
    const editable = ['full_name', 'phone', 'license_id', 'brokerage_name', 'brokerage_license']
    for (const field of editable) {
        if (body[field] !== undefined) allowedFields[field] = body[field]
    }

    if (Object.keys(allowedFields).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await sb
        .from('brokers')
        .update({ ...allowedFields, updated_at: new Date().toISOString() })
        .eq('id', broker.id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}
