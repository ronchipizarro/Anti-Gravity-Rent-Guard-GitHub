import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSignatureRequest } from '@/lib/dropbox-sign-helpers';

/**
 * POST /api/contracts/send
 *
 * Triggered by underwriter clicking "Send Contracts" in the dashboard
 * - Tenant status: APPROVED → CONTRACT_SENT
 * - Creates Dropbox Sign signature request (tenant + owner sign)
 * - Stores signature_request_id in Supabase for polling/webhook handling
 */
export async function POST(request: Request) {
    try {
        const { applicationId } = await request.json();

        if (!applicationId) {
            return NextResponse.json(
                { error: 'applicationId is required' },
                { status: 400 },
            );
        }

        // 1. Fetch application details
        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase not configured' },
                { status: 500 },
            );
        }

        const { data: app, error: fetchErr } = await supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (fetchErr || !app) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 },
            );
        }

        // 2. Validate pre-requisites
        const tenantData = app.tenant_data || {};
        const ownerData = app.owner_data || {};
        const decision = app.decision || {};

        const tenantName = `${tenantData.first_name || ''} ${tenantData.last_name || ''}`.trim();
        const tenantEmail = tenantData.email;
        const ownerName = `${ownerData.first_name || ''} ${ownerData.last_name || ''}`.trim();
        const ownerEmail = ownerData.email;

        if (!tenantName || !tenantEmail || !ownerName || !ownerEmail) {
            return NextResponse.json(
                {
                    error: 'Missing required contact information (tenant/owner name and email)',
                },
                { status: 400 },
            );
        }

        // 3. Calculate fee (if not already set)
        let feeMonthly = app.fee_monthly;
        if (!feeMonthly) {
            const monthlyRent = ownerData?.property?.monthly_rent || 3000;
            // Default: use decision tier to calculate fee
            // (In a real flow, underwriter sets this explicitly)
            const tier = decision.tier || 'YELLOW';
            if (tier === 'GREEN') {
                feeMonthly = (monthlyRent * 0.05) / 12;
            } else if (tier === 'YELLOW') {
                feeMonthly = (monthlyRent * 0.08) / 12;
            } else {
                return NextResponse.json(
                    { error: 'RED tier cannot proceed without cosigner' },
                    { status: 400 },
                );
            }
        }

        // 4. Create Dropbox Sign signature request
        const monthlyRent = ownerData?.property?.monthly_rent || 3000;
        const propertyAddress = ownerData?.property?.address || '(Address TBD)';

        let cosignerEmail = undefined;
        let cosignerName = undefined;
        if (app.cosigner_email) {
            cosignerEmail = app.cosigner_email;
            cosignerName = app.cosigner_name || 'Cosigner';
        }

        const envelopeResult = await createSignatureRequest({
            applicationId,
            tenantName,
            tenantEmail,
            ownerName,
            ownerEmail,
            cosignerEmail,
            cosignerName,
            propertyAddress,
            monthlyRent,
            feeMonthly,
        });

        // 5. Update application: status → CONTRACT_SENT, store signature request ID
        const { error: updateErr } = await supabase
            .from('applications')
            .update({
                status: 'CONTRACT_SENT',
                dropbox_sign_request_id: envelopeResult.signature_request_id,
                fee_monthly: feeMonthly,
            })
            .eq('id', applicationId);

        if (updateErr) {
            return NextResponse.json(
                { error: `Failed to update application: ${updateErr.message}` },
                { status: 500 },
            );
        }

        // 6. Return success with signing details
        return NextResponse.json({
            success: true,
            message: 'Signature request created and sent',
            signature_request_id: envelopeResult.signature_request_id,
            signers: envelopeResult.signers,
        });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Send Contracts API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 },
        );
    }
}
