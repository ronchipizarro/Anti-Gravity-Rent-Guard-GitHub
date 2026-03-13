import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';
import { renderEmail } from '@/lib/email-renderer';
import { underwrite, UnderwritingInput } from '@/lib/underwriting';
import { AgentReviewEmail } from '@/components/emails/AgentReviewEmail';
import { OwnerNotificationEmail } from '@/components/emails/OwnerNotificationEmail';
import React from 'react';

const UNDERWRITER_EMAIL = process.env.UNDERWRITER_EMAIL || 'francisco@usadamant.com';

export async function POST(request: Request) {
    try {
        const { applicationId, tenantData, ownerEmail } = await request.json();

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
        const underwritingInput: UnderwritingInput = {
            monthlyRent: Number(rent),
            monthlyGrossIncome: Number(tenantData.gross_income) + Number(tenantData.other_income || 0),
            creditScore: 680, // placeholder — would come from credit check in production
            employmentStatus: tenantData.employment_status?.includes('W-2') ? 'w2' : '1099',
            employmentTenureMonths: Number(tenantData.years_employed || 0) * 12,
            priorEviction: false,
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
        }

        // 4. Send notification emails
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const tenantName = `${tenantData.first_name || ''} ${tenantData.last_name || ''}`.trim() || 'Applicant';
        const resolvedOwnerEmail = ownerEmail || appData?.owner_data?.email || appData?.owner_data?.tenant_preview?.email;

        if (resend) {
            // 4a. Email to human underwriting agent
            try {
                await resend.emails.send({
                    from: 'RentGuard <noreply@contact.rentguard.us.com>',
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
                        from: 'RentGuard <noreply@contact.rentguard.us.com>',
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
