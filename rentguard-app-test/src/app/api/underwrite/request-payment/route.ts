/**
 * API endpoint to request payment for RentGuard protection
 * Generates Stripe payment link and sends to fee payer
 * Note: Stripe integration requires API keys to be configured
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend';
import { renderEmail } from '@/lib/email-renderer'
import { PaymentRequestEmail } from '@/components/emails/PaymentRequestEmail'
import { PaymentNoticeEmail } from '@/components/emails/PaymentNoticeEmail'
import React from 'react'

export async function POST(request: Request) {
    try {
        const { applicationId, feePayer } = await request.json()

        if (!applicationId) {
            return NextResponse.json({ error: 'applicationId is required' }, { status: 400 })
        }

        // 1. Fetch the application
        const { data: app, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single()

        if (fetchError || !app) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 })
        }

        // Verify status is CONTRACT_SIGNED
        if (app.status !== 'CONTRACT_SIGNED') {
            return NextResponse.json(
                { error: `Cannot request payment for application with status: ${app.status}` },
                { status: 400 }
            )
        }

        // 2. Determine fee payer
        const ownerData = app.owner_data || {}
        const tenantData = app.tenant_data || {}
        const selectedFeePayer = feePayer || ownerData.fee_payer || 'owner'

        // 3. Determine fee payer email
        const feePayerEmail = selectedFeePayer === 'owner' ? ownerData.email : tenantData.email
        const nonFeePayerEmail = selectedFeePayer === 'owner' ? tenantData.email : ownerData.email

        if (!feePayerEmail) {
            return NextResponse.json(
                { error: `No email found for fee payer (${selectedFeePayer})` },
                { status: 400 }
            )
        }

        // 4. Calculate fee (4% of monthly rent)
        const monthlyRent = typeof ownerData.property?.monthly_rent === 'string'
            ? parseFloat(ownerData.property.monthly_rent)
            : ownerData.property?.monthly_rent || 0

        const feeAmount = monthlyRent * 0.04

        // 5. Create Stripe payment link
        // NOTE: Stripe integration requires STRIPE_SECRET_KEY environment variable
        // This is a placeholder that will be completed when Stripe API keys are available
        let paymentLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/payment/${applicationId}`

        if (process.env.STRIPE_SECRET_KEY) {
            try {
                // TODO: Implement Stripe payment link creation
                // For now, use a mock payment link format
                paymentLink = `https://checkout.stripe.com/pay/cs_${applicationId}`
            } catch (error) {
                console.error('Failed to create Stripe payment link:', error)
                return NextResponse.json(
                    { error: 'Failed to create payment link' },
                    { status: 500 }
                )
            }
        } else {
            console.warn('STRIPE_SECRET_KEY not configured - using placeholder payment link')
        }

        // 6. Update application in database
        const updatedOwnerData = {
            ...ownerData,
            fee_payer: selectedFeePayer,
        }

        const { error: updateError } = await supabase
            .from('applications')
            .update({
                status: 'PAYMENT_PENDING',
                owner_data: updatedOwnerData,
                payment_link: paymentLink,
                payment_requested_at: new Date().toISOString(),
            })
            .eq('id', applicationId)

        if (updateError) {
            console.error('Failed to update application:', updateError)
            return NextResponse.json(
                { error: 'Failed to update application' },
                { status: 500 }
            )
        }

        // 7. Prepare email data
        const propertyAddress = ownerData.property?.address || 'Unknown'
        const feePayerName = selectedFeePayer === 'owner' ? ownerData.first_name || 'Owner' : tenantData.first_name || 'Tenant'
        const nonFeePayerName = selectedFeePayer === 'owner' ? tenantData.first_name || 'Tenant' : ownerData.first_name || 'Owner'

        // 8. Send emails
        try {
            if (resend) {
                // Email to fee payer
                await resend!.emails.send({
                    from: RESEND_FROM_EMAIL,
                    to: [feePayerEmail],
                    subject: 'Complete Your RentGuard Payment – Protection Activation',
                    html: await renderEmail(React.createElement(PaymentRequestEmail as any, {
                        recipientName: feePayerName,
                        feeAmount,
                        propertyAddress,
                        paymentLink,
                        feePayer: selectedFeePayer,
                    })),
                })

                // Email to non-fee payer (informational)
                if (nonFeePayerEmail) {
                    await resend!.emails.send({
                        from: RESEND_FROM_EMAIL,
                        to: [nonFeePayerEmail],
                        subject: 'RentGuard Protection – Payment in Progress',
                        html: await renderEmail(React.createElement(PaymentNoticeEmail as any, {
                            recipientName: nonFeePayerName,
                            feePayer: selectedFeePayer,
                            propertyAddress,
                            monthlyFee: feeAmount,
                        })),
                    })
                }

                // Email to underwriter
                const underwriterEmail = process.env.UNDERWRITER_EMAIL || 'francisco@usadamant.com'
                await resend!.emails.send({
                    from: RESEND_FROM_EMAIL,
                    to: [underwriterEmail],
                    subject: `Payment Requested - ${propertyAddress}`,
                    html: await renderEmail(React.createElement(PaymentRequestEmail as any, {
                        recipientName: 'Underwriter',
                        feeAmount,
                        propertyAddress,
                        paymentLink,
                        feePayer: selectedFeePayer,
                    })),
                })
            } else {
                console.warn('RESEND_API_KEY is not configured. Emails will not be sent.')
            }
        } catch (emailError) {
            console.error('Failed to send emails:', emailError)
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            success: true,
            applicationId,
            paymentLink,
            feeAmount,
            feePayer: selectedFeePayer,
            message: `Payment link sent to ${feePayerEmail}`,
        })

    } catch (error: any) {
        console.error('Request payment API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
