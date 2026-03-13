import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';
import { renderEmail } from '@/lib/email-renderer';
import { TenantInviteEmail } from '@/components/emails/TenantInviteEmail';
import React from 'react';

export async function POST(request: Request) {
    try {
        // applicationId is optional: if supplied, skip DB creation (application already exists)
        const { tenantEmail, landlordEmail, monthlyRent, propertyAddress, applicationId: existingId } = await request.json();

        if (!tenantEmail || !monthlyRent) {
            return NextResponse.json({ error: 'Tenant email and monthly rent are required.' }, { status: 400 });
        }

        let applicationId = existingId;

        // 1. Create application in Supabase only if no existing ID was provided
        if (!applicationId) {
            if (!supabase) {
                return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
            }

            const { data: application, error: dbError } = await supabase
                .from('applications')
                .insert([
                    {
                        tenant_data: { email: tenantEmail },
                        owner_data: { email: landlordEmail, propertyAddress, monthlyRent },
                        status: 'PENDING_TENANT',
                        invite_only: true
                    }
                ])
                .select()
                .single();

            if (dbError) throw dbError;
            applicationId = application.id;
        }

        // 2. Send Invite Email
        if (resend) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

            const { error: emailError } = await resend.emails.send({
                from: 'RentGuard <noreply@contact.rentguard.us.com>',
                to: [tenantEmail],
                subject: 'You have been invited to apply for RentGuard coverage',
                html: await renderEmail(React.createElement(TenantInviteEmail, { applicationId, baseUrl })),
            });

            if (emailError) {
                console.error('Resend error:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            applicationId,
            message: 'Invitation sent successfully.'
        });

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Invite API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
