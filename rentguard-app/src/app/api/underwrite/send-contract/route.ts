/**
 * API endpoint to send contracts via Dropbox Sign
 * Generates contract PDF and initiates e-signature workflow
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateContractPdf } from '@/lib/contract-pdf'
import { createSignatureEnvelope } from '@/lib/dropbox-sign'
import { resend } from '@/lib/resend'
import { renderEmail } from '@/lib/email-renderer'
import { ContractSentEmail } from '@/components/emails/ContractSentEmail'
import React from 'react'

export async function POST(request: Request) {
    try {
        const { applicationId } = await request.json()

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

        // Verify status is APPROVED
        if (app.status !== 'APPROVED') {
            return NextResponse.json(
                { error: `Cannot send contract for application with status: ${app.status}` },
                { status: 400 }
            )
        }

        // 2. Extract data for contract
        const tenantData = app.tenant_data || {}
        const ownerData = app.owner_data || {}

        const contractData = {
            applicationId: app.id,
            property: {
                address: ownerData.property?.address || 'Unknown',
                city: ownerData.property?.city || '',
                state: ownerData.property?.state || '',
                zip: ownerData.property?.zip,
                monthly_rent: ownerData.property?.monthly_rent || 0,
            },
            tenant: {
                first_name: tenantData.first_name || '',
                last_name: tenantData.last_name || '',
                email: tenantData.email || '',
            },
            owner: {
                first_name: ownerData.first_name,
                last_name: ownerData.last_name,
                email: ownerData.email || '',
            },
            fee_payer: ownerData.fee_payer || 'owner',
        }

        // 3. Generate contract PDF
        let contractPdf: Buffer
        try {
            contractPdf = await generateContractPdf(contractData)
        } catch (error) {
            console.error('Failed to generate contract PDF:', error)
            return NextResponse.json(
                { error: 'Failed to generate contract PDF' },
                { status: 500 }
            )
        }

        // 4. Send to Dropbox Sign for e-signature
        let envelopeId: string
        let signingLink: string
        try {
            const result = await createSignatureEnvelope(
                contractPdf,
                contractData.tenant.email,
                `${contractData.tenant.first_name} ${contractData.tenant.last_name}`,
                contractData.owner.email,
                applicationId
            )
            envelopeId = result.envelope_id
            signingLink = result.signing_link
        } catch (error) {
            console.error('Failed to create signature envelope:', error)
            return NextResponse.json(
                { error: 'Failed to initiate e-signature process' },
                { status: 500 }
            )
        }

        // 5. Update database
        const { error: updateError } = await supabase
            .from('applications')
            .update({
                status: 'CONTRACT_SENT',
                docusign_envelope_id: envelopeId,
                contract_sent_at: new Date().toISOString(),
            })
            .eq('id', applicationId)

        if (updateError) {
            console.error('Failed to update application:', updateError)
            return NextResponse.json(
                { error: 'Failed to update application status' },
                { status: 500 }
            )
        }

        // 6. Send emails
        const emailData = {
            tenantName: `${contractData.tenant.first_name} ${contractData.tenant.last_name}`,
            ownerName: `${contractData.owner.first_name || 'Owner'} ${contractData.owner.last_name || ''}`,
            signingLink,
            propertyAddress: contractData.property.address,
            monthlyRent: contractData.property.monthly_rent,
            feePayer: contractData.fee_payer === 'owner' ? 'Property Owner' : 'Tenant',
        }

        try {
            if (resend) {
                // Send to tenant and owner
                const signerEmails = [contractData.tenant.email, contractData.owner.email].filter(Boolean)
                await Promise.all(signerEmails.map(async email =>
                    resend!.emails.send({
                        from: 'RentGuard <noreply@contact.rentguard.us.com>',
                        to: [email],
                        subject: 'Your RentGuard Protection Contracts are Ready to Sign',
                        html: await renderEmail(React.createElement(ContractSentEmail as any, emailData)),
                    })
                ))

                // Send notification to underwriter
                const underwriterEmail = process.env.UNDERWRITER_EMAIL || 'francisco@usadamant.com'
                await resend!.emails.send({
                    from: 'RentGuard <noreply@contact.rentguard.us.com>',
                    to: [underwriterEmail],
                    subject: `Contracts Sent - ${emailData.tenantName}`,
                    html: await renderEmail(React.createElement(ContractSentEmail as any, emailData)),
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
            envelopeId,
            signingLink,
            message: `Contracts sent to ${contractData.tenant.email} and ${contractData.owner.email}`,
        })

    } catch (error: any) {
        console.error('Send contract API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
