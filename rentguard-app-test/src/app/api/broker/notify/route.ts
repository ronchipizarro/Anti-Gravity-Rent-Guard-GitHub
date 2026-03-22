import { NextResponse } from 'next/server'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend'
import { getPublicSupabase } from '@/lib/broker-api'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

export async function POST(request: Request) {
    const body = await request.json()
    const { broker_id, application_id, status, property_address, tenant_name } = body

    if (!broker_id) {
        return NextResponse.json({ error: 'broker_id required' }, { status: 400 })
    }

    const sb = getPublicSupabase()

    const { data: broker } = await sb
        .from('brokers')
        .select('full_name, email')
        .eq('id', broker_id)
        .single()

    if (!broker) return NextResponse.json({ error: 'Broker not found' }, { status: 404 })

    if (!resend) return NextResponse.json({ message: 'Email not configured' })

    try {
        await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: broker.email,
            subject: `Application Update: ${property_address || 'Property'} — ${status}`,
            html: `
                <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #000; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: #fff; margin: 0; font-size: 24px;">RentGuard</h1>
                    </div>
                    <div style="padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                        <h2 style="margin: 0 0 16px;">Application Status Update</h2>
                        <p>Hi ${broker.full_name},</p>
                        <p>An application linked to your account has been updated:</p>
                        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                            ${property_address ? `<strong>Property:</strong> ${property_address}<br/>` : ''}
                            ${tenant_name ? `<strong>Tenant:</strong> ${tenant_name}<br/>` : ''}
                            <strong>New Status:</strong> ${status}
                        </div>
                        <a href="${APP_URL}/broker/deals" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                            View on Dashboard
                        </a>
                    </div>
                </div>
            `,
        })
        return NextResponse.json({ message: 'Notification sent' })
    } catch (err) {
        console.error('Failed to send broker notification:', err)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}
