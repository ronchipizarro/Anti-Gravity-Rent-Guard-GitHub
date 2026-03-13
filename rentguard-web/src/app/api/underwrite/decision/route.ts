import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';
import { renderEmail } from '@/lib/email-renderer';
import { TenantDecisionEmail } from '@/components/emails/TenantDecisionEmail';
import { CosignerRequestEmail } from '@/components/emails/CosignerRequestEmail';
import React from 'react';

export async function POST(request: Request) {
    try {
        const { applicationId, action } = await request.json();

        if (!applicationId || !action) {
            return NextResponse.json({ error: 'applicationId and action are required.' }, { status: 400 });
        }

        if (!['approve', 'reject', 'cosigner'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action. Must be: approve, reject, or cosigner.' }, { status: 400 });
        }

        // 1. Fetch the application
        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
        }

        const { data: app, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (fetchError || !app) {
            return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
        }

        const tenantData = app.tenant_data || {};
        const tenantName = `${tenantData.first_name || ''} ${tenantData.last_name || ''}`.trim() || 'Applicant';
        const tenantEmail = tenantData.email;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // 2. Update application status
        let newStatus: string;
        switch (action) {
            case 'approve':
                newStatus = 'APPROVED';
                break;
            case 'reject':
                newStatus = 'REJECTED';
                break;
            case 'cosigner':
                newStatus = 'PENDING_COSIGNER';
                break;
            default:
                newStatus = 'PENDING_REVIEW';
        }

        const decisionPayload = {
            ...app.decision,
            human_decision: action,
            human_decision_at: new Date().toISOString(),
        };

        let { error: updateError } = await supabase
            .from('applications')
            .update({ status: newStatus, decision: decisionPayload })
            .eq('id', applicationId);

        // Fallback: PENDING_COSIGNER requires migration 00002 — use SUBMITTED if not applied
        if (updateError?.code === '23514' && action === 'cosigner') {
            newStatus = 'SUBMITTED';
            ({ error: updateError } = await supabase
                .from('applications')
                .update({ status: newStatus, decision: decisionPayload })
                .eq('id', applicationId));
        }

        if (updateError) throw updateError;

        // 3. Send email to tenant
        if (resend && tenantEmail) {
            try {
                if (action === 'approve' || action === 'reject') {
                    await resend.emails.send({
                        from: 'RentGuard <noreply@contact.rentguard.us.com>',
                        to: [tenantEmail],
                        subject: action === 'approve'
                            ? '🎉 Your RentGuard Application Has Been Approved!'
                            : 'Update on Your RentGuard Application',
                        html: await renderEmail(React.createElement(TenantDecisionEmail, {
                            tenantName,
                            decision: action === 'approve' ? 'approved' : 'rejected',
                        })),
                    });
                } else if (action === 'cosigner') {
                    await resend.emails.send({
                        from: 'RentGuard <noreply@contact.rentguard.us.com>',
                        to: [tenantEmail],
                        subject: 'Action Required: Cosigner Needed for Your RentGuard Application',
                        html: await renderEmail(React.createElement(CosignerRequestEmail, {
                            tenantName,
                            applicationId,
                            baseUrl,
                        })),
                    });
                }
            } catch (e) {
                console.error('Failed to send tenant decision email:', e);
            }
        }

        return NextResponse.json({
            success: true,
            action,
            newStatus,
            message: `Application ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'cosigner requested'}. Tenant has been notified.`,
        });

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Decision API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
