import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend';
import { renderEmail } from '@/lib/email-renderer';
import { underwrite, UnderwritingInput } from '@/lib/underwriting';
import { AgentReviewEmail } from '@/components/emails/AgentReviewEmail';
import { OwnerNotificationEmail } from '@/components/emails/OwnerNotificationEmail';
import React from 'react';

const UNDERWRITER_EMAIL = process.env.UNDERWRITER_EMAIL || 'francisco@usadamant.com';

export async function POST(request: Request) {
    try {
        const { applicationId, tenantData, ownerEmail, broker_id, property_id, invitation_id, invite_token } = await request.json();

        if (!applicationId || !tenantData) {
            return NextResponse.json({ error: 'applicationId and tenantData are required.' }, { status: 400 });
        }

        // 1. Fetch existing application to get owner data
        let appData: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (supabase) {
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .eq('id', applicationId)
                .single();
            if (error) throw error;
            appData = data;
        }

        const rent = appData?.owner_data?.property?.monthly_rent || tenantData.monthly_rent || 3000;

        // 2. Run underwriting engine
        // Resolve credit score: 'unknown' maps to 620 (YELLOW zone — manual review)
        const rawCreditScore = tenantData.credit_score;
        const resolvedCreditScore = !rawCreditScore || rawCreditScore === 'unknown'
            ? 620
            : Number(rawCreditScore);

        // Resolve employment status
        const empStatus = tenantData.employment_status || '';
        let employmentStatus: UnderwritingInput['employmentStatus'] = 'other';
        if (empStatus.includes('W-2')) employmentStatus = 'w2';
        else if (empStatus.includes('1099') || empStatus.includes('Self')) employmentStatus = 'self_employed';
        else if (empStatus.includes('Retired')) employmentStatus = 'retired';

        const underwritingInput: UnderwritingInput = {
            monthlyRent: Number(rent),
            monthlyGrossIncome: Number(tenantData.gross_income) + Number(tenantData.other_income || 0),
            creditScore: resolvedCreditScore,
            employmentStatus,
            employmentTenureMonths: Number(tenantData.years_employed || 0) * 12,
            priorEviction: tenantData.eviction_history === 'yes',
        };

        const decision = underwrite(underwritingInput);

        // 3. Update application in Supabase
        // Try PENDING_REVIEW first (requires migration 00002); fall back to SUBMITTED
        if (supabase) {
            let { error: updateError } = await supabase
                .from('applications')
                .update({ tenant_data: tenantData, decision, status: 'PENDING_REVIEW' })
                .eq('id', applicationId);

            if (updateError?.code === '23514') {
                // Constraint violation — migration 00002 not applied yet; use SUBMITTED
                ({ error: updateError } = await supabase
                    .from('applications')
                    .update({ tenant_data: tenantData, decision, status: 'SUBMITTED' })
                    .eq('id', applicationId));
            }

            if (updateError) throw updateError;

            // If broker-linked, also set broker_id/property_id/invitation_id on the application
            if (broker_id || property_id || invitation_id) {
                const brokerFields: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
                if (broker_id) brokerFields.broker_id = broker_id;
                if (property_id) brokerFields.property_id = property_id;
                if (invitation_id) brokerFields.invitation_id = invitation_id;

                await supabase
                    .from('applications')
                    .update(brokerFields)
                    .eq('id', applicationId);
            }

            // Update invitation status to accepted
            if (invitation_id) {
                await supabase
                    .from('invitations')
                    .update({ status: 'accepted', application_id: applicationId, accepted_at: new Date().toISOString() })
                    .eq('id', invitation_id);
            } else if (invite_token) {
                await supabase
                    .from('invitations')
                    .update({ status: 'accepted', application_id: applicationId, accepted_at: new Date().toISOString() })
                    .eq('invite_token', invite_token);
            }

            // Update property status to tenant_applied
            if (property_id) {
                await supabase
                    .from('properties')
                    .update({ status: 'tenant_applied', updated_at: new Date().toISOString() })
                    .eq('id', property_id);
            }
        }

        // 4. Send notification emails
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const tenantName = `${tenantData.first_name || ''} ${tenantData.last_name || ''}`.trim() || 'Applicant';
        const resolvedOwnerEmail = ownerEmail || appData?.owner_data?.email || appData?.owner_data?.tenant_preview?.email;

        if (resend) {
            // 4a. Email to human underwriting agent
            try {
                await resend.emails.send({
                    from: RESEND_FROM_EMAIL,
                    to: [UNDERWRITER_EMAIL],
                    subject: `[Review Required] New Application — ${tenantName}`,
                    html: await renderEmail(React.createElement(AgentReviewEmail, {
                        applicationId,
                        tenantName,
                        monthlyRent: Number(rent),
                        aiDecision: decision.tier,
                        aiScore: decision.score,
                        recommendations: decision.recommendations.length > 0
                            ? decision.recommendations
                            : [decision.summary],
                        baseUrl,
                    })),
                });
            } catch (e) {
                console.error('Failed to send agent review email:', e);
            }

            // 4b. Email to owner/broker
            if (resolvedOwnerEmail) {
                try {
                    await resend.emails.send({
                        from: RESEND_FROM_EMAIL,
                        to: [resolvedOwnerEmail],
                        subject: `Application Submitted — ${tenantName}`,
                        html: await renderEmail(React.createElement(OwnerNotificationEmail, {
                            tenantName,
                            propertyAddress: appData?.owner_data?.property?.address,
                        })),
                    });
                } catch (e) {
                    console.error('Failed to send owner notification email:', e);
                }
            }
        }

        // 5. Notify broker if application is broker-linked
        if (broker_id) {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
                await fetch(`${baseUrl}/api/broker/notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        broker_id,
                        application_id: applicationId,
                        status: 'PENDING_REVIEW',
                        property_address: appData?.owner_data?.property?.address || '',
                        tenant_name: `${tenantData.first_name || ''} ${tenantData.last_name || ''}`.trim(),
                    }),
                });
            } catch (e) {
                console.error('Failed to notify broker:', e);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Application submitted. The underwriting team will review it shortly.',
            decision: { tier: decision.tier, score: decision.score },
        });

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Apply/Submit API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
