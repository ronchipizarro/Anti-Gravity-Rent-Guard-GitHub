import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend';
import { renderEmail } from '@/lib/email-renderer';
import { CosignerInviteEmail } from '@/components/emails/CosignerInviteEmail';
import React from 'react';

export async function POST(request: Request) {
    try {
        const { applicationId, cosignerData } = await request.json();

        if (!applicationId || !cosignerData) {
            return NextResponse.json({ error: 'applicationId and cosignerData are required.' }, { status: 400 });
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
        }

        // 1. Fetch the application
        const { data: app, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (fetchError || !app) {
            return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
        }

        // 2. Update application with cosigner info
        const { error: updateError } = await supabase
            .from('applications')
            .update({
                tenant_data: {
                    ...app.tenant_data,
                    cosigner: cosignerData,
                },
                status: 'PENDING_COSIGNER_DOCS',
            })
            .eq('id', applicationId);

        if (updateError) throw updateError;

        // 3. Send invite email to cosigner
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const tenantName = `${app.tenant_data?.first_name || ''} ${app.tenant_data?.last_name || ''}`.trim() || 'Applicant';
        const cosignerName = `${cosignerData.first_name || ''} ${cosignerData.last_name || ''}`.trim() || 'Cosigner';

        if (resend && cosignerData.email) {
            try {
                await resend.emails.send({
                    from: RESEND_FROM_EMAIL,
                    to: [cosignerData.email],
                    subject: `${tenantName} needs you as a cosigner — RentGuard`,
                    html: await renderEmail(React.createElement(CosignerInviteEmail, {
                        cosignerName,
                        tenantName,
                        applicationId,
                        baseUrl,
                    })),
                });
            } catch (e) {
                console.error('Failed to send cosigner invite email:', e);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Cosigner details saved. An invite has been sent to their email.',
        });

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Cosigner API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
