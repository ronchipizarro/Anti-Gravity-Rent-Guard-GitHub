import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';
import { renderEmail } from '@/lib/email-renderer';
import { AgentReviewEmail } from '@/components/emails/AgentReviewEmail';
import React from 'react';

const UNDERWRITER_EMAIL = process.env.UNDERWRITER_EMAIL || 'francisco@usadamant.com';

export async function POST(request: Request) {
    try {
        const { applicationId, documents } = await request.json();

        if (!applicationId) {
            return NextResponse.json({ error: 'applicationId is required.' }, { status: 400 });
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
        }

        // 1. Fetch application
        const { data: app, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (fetchError || !app) {
            return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
        }

        // 2. Update with cosigner docs
        const { error: updateError } = await supabase
            .from('applications')
            .update({
                tenant_data: {
                    ...app.tenant_data,
                    cosigner: {
                        ...app.tenant_data?.cosigner,
                        documents,
                    },
                },
                status: 'COSIGNER_SUBMITTED',
            })
            .eq('id', applicationId);

        if (updateError) throw updateError;

        // 3. Notify the human underwriter that cosigner docs are in
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const tenantName = `${app.tenant_data?.first_name || ''} ${app.tenant_data?.last_name || ''}`.trim() || 'Applicant';
        const cosignerName = `${app.tenant_data?.cosigner?.first_name || ''} ${app.tenant_data?.cosigner?.last_name || ''}`.trim() || 'Cosigner';

        if (resend) {
            try {
                await resend.emails.send({
                    from: 'RentGuard <noreply@contact.rentguard.us.com>',
                    to: [UNDERWRITER_EMAIL],
                    subject: `[Cosigner Docs Received] ${tenantName} — Cosigner: ${cosignerName}`,
                    html: await renderEmail(React.createElement(AgentReviewEmail, {
                        applicationId,
                        tenantName: `${tenantName} (Cosigner: ${cosignerName})`,
                        monthlyRent: Number(app.owner_data?.property?.monthly_rent || 0),
                        aiDecision: app.decision?.tier || 'YELLOW',
                        aiScore: app.decision?.score || 0,
                        recommendations: ['Cosigner documents have been submitted. Please review the cosigner profile and make a final decision.'],
                        baseUrl,
                    })),
                });
            } catch (e) {
                console.error('Failed to send cosigner review email:', e);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Cosigner documents submitted. The underwriting team has been notified.',
        });

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Cosigner Submit API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
