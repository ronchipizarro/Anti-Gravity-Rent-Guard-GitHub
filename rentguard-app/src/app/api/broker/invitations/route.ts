import { NextResponse } from 'next/server'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend'
import { getBrokerFromRequest } from '@/lib/broker-api'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

export async function GET(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth

    const { data, error } = await sb
        .from('invitations')
        .select('*, properties(address, city, state)')
        .eq('broker_id', broker.id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth
    const body = await request.json()
    const { renter_name, renter_email, property_id } = body

    if (!renter_name || !renter_email || !property_id) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check max 4 renters per property
    const { count } = await sb
        .from('invitations')
        .select('id', { count: 'exact', head: true })
        .eq('property_id', property_id)
        .in('role', ['renter', 'co_renter'])

    if ((count || 0) >= 4) {
        return NextResponse.json({ error: 'Maximum 4 renters per property' }, { status: 400 })
    }

    // Verify broker owns the property
    const { data: property } = await sb
        .from('properties')
        .select('id, address, city, state, monthly_rent, property_type')
        .eq('id', property_id)
        .eq('broker_id', broker.id)
        .single()

    if (!property) {
        return NextResponse.json({ error: 'Property not found or not yours' }, { status: 404 })
    }

    // Create invitation
    const { data: invitation, error } = await sb
        .from('invitations')
        .insert({
            property_id,
            broker_id: broker.id,
            renter_name,
            renter_email,
            role: 'renter',
            status: 'sent',
            sent_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update property status to invitations_sent
    await sb
        .from('properties')
        .update({ status: 'invitations_sent', updated_at: new Date().toISOString() })
        .eq('id', property_id)
        .eq('status', 'enrolled')

    // Send email
    if (resend) {
        try {
            const inviteLink = `${APP_URL}/apply/tenant?invite=${invitation.invite_token}&property=${property_id}`

            await resend.emails.send({
                from: RESEND_FROM_EMAIL,
                to: renter_email,
                subject: `${broker.full_name} invited you to apply for rental protection`,
                html: `
                    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #000; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #fff; margin: 0; font-size: 24px;">RentGuard</h1>
                        </div>
                        <div style="padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                            <h2 style="margin: 0 0 16px;">You've been invited!</h2>
                            <p>${broker.full_name} has invited you to apply for rental protection at:</p>
                            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                                <strong>${property.address}</strong><br/>
                                ${property.city}, ${property.state}<br/>
                                Rent: $${property.monthly_rent}/mo
                            </div>
                            <a href="${inviteLink}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                                Start Your Application
                            </a>
                        </div>
                    </div>
                `,
            })
        } catch (emailErr) {
            console.error('Failed to send invitation email:', emailErr)
        }
    }

    return NextResponse.json(invitation, { status: 201 })
}
