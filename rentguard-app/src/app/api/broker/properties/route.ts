import { NextResponse } from 'next/server'
import { getBrokerFromRequest } from '@/lib/broker-api'

export async function GET(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth

    // Brokers see own + child realtors' properties; realtors/owners see only own
    let query = sb.from('properties').select('*').order('created_at', { ascending: false })

    if (broker.role === 'broker') {
        const { data: children } = await sb
            .from('brokers')
            .select('id')
            .eq('parent_broker_id', broker.id)

        const ids = [broker.id, ...(children?.map(c => c.id) || [])]
        query = query.in('broker_id', ids)
    } else {
        query = query.eq('broker_id', broker.id)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth
    const body = await request.json()

    const { data, error } = await sb
        .from('properties')
        .insert({
            broker_id: broker.id,
            property_type: body.property_type,
            address: body.address,
            city: body.city || 'Miami',
            state: body.state || 'FL',
            zip: body.zip,
            floor: body.floor || null,
            unit_number: body.unit_number || null,
            bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
            monthly_rent: parseFloat(body.monthly_rent),
            lease_duration_months: parseInt(body.lease_duration_months) || 12,
            lease_status: body.lease_status || 'new',
            fee_payer: body.fee_payer || 'owner',
            is_llc: body.is_llc || false,
            llc_name: body.llc_name || null,
            llc_address: body.llc_address || null,
            llc_rep_name: body.llc_rep_name || null,
            llc_rep_email: body.llc_rep_email || null,
            has_owner_info: body.has_owner_info || false,
            owner_name: body.owner_name || null,
            owner_email: body.owner_email || null,
            owner_phone: body.owner_phone || null,
            is_broker_pm: body.is_broker_pm || false,
            has_pm: body.has_pm || false,
            pm_name: body.pm_name || null,
            pm_email: body.pm_email || null,
            pm_will_sign: body.pm_will_sign || false,
            status: 'enrolled',
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}
