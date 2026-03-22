import { NextResponse } from 'next/server'
import { getPublicSupabase } from '@/lib/broker-api'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.json({ error: 'Invite token required' }, { status: 400 })
    }

    const sb = getPublicSupabase()

    // Validate the invite token
    const { data: invitation, error: invError } = await sb
        .from('invitations')
        .select('*, brokers(full_name, brokerage_name)')
        .eq('invite_token', token)
        .eq('property_id', params.id)
        .single()

    if (invError || !invitation) {
        return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    if (invitation.status === 'expired' || invitation.status === 'declined') {
        return NextResponse.json({ error: 'This invitation has expired' }, { status: 410 })
    }

    // Fetch property info
    const { data: property, error: propError } = await sb
        .from('properties')
        .select('id, address, city, state, zip, property_type, monthly_rent, bedrooms, broker_id')
        .eq('id', params.id)
        .single()

    if (propError || !property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({
        property,
        invitation: {
            id: invitation.id,
            broker_id: invitation.broker_id,
            broker_name: invitation.brokers?.full_name || '',
            brokerage_name: invitation.brokers?.brokerage_name || '',
            renter_name: invitation.renter_name,
            renter_email: invitation.renter_email,
        },
    })
}
