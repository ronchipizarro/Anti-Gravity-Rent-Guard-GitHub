import { NextResponse } from 'next/server'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend'
import { getBrokerFromRequest } from '@/lib/broker-api'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

export async function GET(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth

    if (broker.role !== 'broker') {
        return NextResponse.json({ error: 'Only brokers can manage teammates' }, { status: 403 })
    }

    // Get teammate invitations (role = broker or realtor)
    const { data, error } = await sb
        .from('invitations')
        .select('*')
        .eq('broker_id', broker.id)
        .in('role', ['broker', 'realtor'])
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const auth = await getBrokerFromRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { broker, supabase: sb } = auth

    if (broker.role !== 'broker') {
        return NextResponse.json({ error: 'Only brokers can invite teammates' }, { status: 403 })
    }

    const body = await request.json()
    const { full_name, email, role } = body

    if (!full_name || !email || !role) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['broker', 'realtor'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { data: invitation, error } = await sb
        .from('invitations')
        .insert({
            broker_id: broker.id,
            renter_name: full_name,
            renter_email: email,
            role,
            status: 'sent',
            sent_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Send teammate invite email
    if (resend) {
        try {
            const inviteLink = `${APP_URL}/broker/register?invite=${invitation.invite_token}&role=${role}&brokerage=${encodeURIComponent(broker.brokerage_name || '')}`

            await resend.emails.send({
                from: RESEND_FROM_EMAIL,
                to: email,
                subject: `${broker.full_name} invited you to join ${broker.brokerage_name || 'their team'} on RentGuard`,
                html: `
                    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #000; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #fff; margin: 0; font-size: 24px;">RentGuard</h1>
                        </div>
                        <div style="padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                            <h2 style="margin: 0 0 16px;">You've been invited!</h2>
                            <p><strong>${broker.full_name}</strong> has invited you to join <strong>${broker.brokerage_name || 'their team'}</strong> on RentGuard as a <strong>${role}</strong>.</p>
                            <a href="${inviteLink}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                                Create Your Account
                            </a>
                        </div>
                    </div>
                `,
            })
        } catch (emailErr) {
            console.error('Failed to send teammate invite email:', emailErr)
        }
    }

    return NextResponse.json(invitation, { status: 201 })
}
