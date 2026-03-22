/**
 * Webhook handler for Dropbox Sign signature completion events
 * Updates application status to CONTRACT_SIGNED when all parties have signed
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateWebhookSignature } from '@/lib/dropbox-sign'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend';
import { renderEmail } from '@/lib/email-renderer'
import { ContractSignedEmail } from '@/components/emails/ContractSignedEmail'
import React from 'react'

export async function POST(request: Request) {
    try {
        // Get raw body for signature validation
        const rawBody = await request.text()
        const xDropboxSignature = request.headers.get('x-dropbox-sign-signature') || ''

        // Validate webhook signature
        if (!validateWebhookSignature(rawBody, xDropboxSignature)) {
            console.warn('Invalid Dropbox Sign webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const webhookData = JSON.parse(rawBody)
        const event = webhookData.event?.event_type

        // We only care about signature_request_signed events
        if (event !== 'signature_request_signed') {
            return NextResponse.json({ success: true, skipped: true })
        }

        const signatureRequest = webhookData.signature_request
        const envelopeId = signatureRequest?.signature_request_id

        if (!envelopeId) {
            console.error('No signature_request_id in webhook')
            return NextResponse.json({ error: 'Missing signature_request_id' }, { status: 400 })
        }

        // Find application by docusign_envelope_id
        const { data: app, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('docusign_envelope_id', envelopeId)
            .single()

        if (fetchError || !app) {
            console.error('Application not found for envelope:', envelopeId)
            return NextResponse.json({ success: true, message: 'Application not found' })
        }

        // Check if all parties have signed
        const signingData = signatureRequest?.signatures || []
        const allSigned = signingData.length >= 2 && signingData.every((sig: any) => sig.signature_id)

        if (!allSigned) {
            console.log(`Envelope ${envelopeId} not fully signed yet`)
            return NextResponse.json({ success: true, message: 'Not all parties have signed' })
        }

        // Update application status to CONTRACT_SIGNED
        const { error: updateError } = await supabase
            .from('applications')
            .update({
                status: 'CONTRACT_SIGNED',
                contract_signed_at: new Date().toISOString(),
            })
            .eq('id', app.id)

        if (updateError) {
            console.error('Failed to update application status:', updateError)
            throw updateError
        }

        // Send confirmation emails
        const tenantData = app.tenant_data || {}
        const ownerData = app.owner_data || {}
        const tenantName = `${tenantData.first_name || ''} ${tenantData.last_name || ''}`.trim()
        const ownerName = `${ownerData.first_name || ''} ${ownerData.last_name || ''}`.trim()
        const tenantEmail = tenantData.email
        const ownerEmail = ownerData.email
        const underwriterEmail = process.env.UNDERWRITER_EMAIL || 'francisco@usadamant.com'

        const emailData = {
            applicationId: app.id,
            tenantName,
            ownerName,
            propertyAddress: ownerData.property?.address || 'Unknown',
            signedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        }

        // Send to all parties
        const emailRecipients = [
            { email: tenantEmail, type: 'tenant' },
            { email: ownerEmail, type: 'owner' },
            { email: underwriterEmail, type: 'underwriter' },
        ].filter(e => e.email)

        try {
            if (resend) {
                await Promise.all(emailRecipients.map(async (recipient) => {
                    try {
                        await resend!.emails.send({
                            from: RESEND_FROM_EMAIL,
                            to: [recipient.email],
                            subject: '✓ Contract Signed – Next Steps for Your RentGuard Protection',
                            html: await renderEmail(React.createElement(ContractSignedEmail as any, {
                                ...emailData,
                                recipientType: recipient.type,
                            })),
                        })
                    } catch (e) {
                        console.error(`Failed to send email to ${recipient.email}:`, e)
                    }
                }))
            } else {
                console.warn('RESEND_API_KEY is not configured. Emails will not be sent.')
            }
        } catch (e) {
            console.error('Email sending failed:', e)
            // Don't fail the webhook if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Application marked as signed',
            applicationId: app.id,
            newStatus: 'CONTRACT_SIGNED',
        })

    } catch (error: any) {
        console.error('Dropbox Sign webhook error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
