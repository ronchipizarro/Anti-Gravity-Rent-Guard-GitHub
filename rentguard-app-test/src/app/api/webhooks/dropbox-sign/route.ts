import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/webhooks/dropbox-sign
 *
 * Webhook endpoint for Dropbox Sign status updates
 * Triggered when a signature request is signed by all parties
 *
 * Payload signature verification:
 * - Dropbox Sign sends X-HelloSign-Signature header
 * - For MVP: skip verification (todo in production)
 */
export async function POST(request: Request) {
    try {
        const body = await request.text();
        const params = new URLSearchParams(body);

        // Parse webhook event
        const eventType = params.get('event.type');
        const signatureRequestId = params.get('signature_request.id');
        const signatureRequestStatus = params.get('signature_request.is_complete');

        console.log('[Dropbox Sign Webhook]', {
            eventType,
            signatureRequestId,
            isComplete: signatureRequestStatus,
        });

        // Only process signature_request_signed / signature_request_all_signed events
        if (!eventType?.includes('signature_request') || eventType === 'signature_request_sent') {
            return NextResponse.json({ success: true });
        }

        if (!signatureRequestId) {
            return NextResponse.json(
                { error: 'No signature_request.id in webhook payload' },
                { status: 400 },
            );
        }

        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase not configured' },
                { status: 500 },
            );
        }

        // 1. Find application by signature_request_id
        const { data: app, error: fetchErr } = await supabase
            .from('applications')
            .select('*')
            .eq('dropbox_sign_request_id', signatureRequestId)
            .single();

        if (fetchErr || !app) {
            console.warn('[Dropbox Sign Webhook] Application not found for request:', signatureRequestId);
            return NextResponse.json({
                success: true,
                message: 'Signature request tracked but no matching application found',
            });
        }

        // 2. Update application status based on webhook event
        let newStatus = app.status;
        let updateData: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

        if (eventType === 'signature_request_all_signed' || signatureRequestStatus === 'true') {
            // All parties have signed
            newStatus = 'CONTRACT_SIGNED';
            updateData = { status: newStatus, contract_signed_at: new Date().toISOString() };
        } else if (eventType === 'signature_request_declined') {
            // One or more parties declined
            newStatus = 'REJECTED';
            updateData = { status: newStatus, contract_declined_at: new Date().toISOString() };
        } else if (eventType === 'signature_request_reassigned') {
            // Request was reassigned (keep status, log event)
            updateData = { contract_reassigned_at: new Date().toISOString() };
        }

        if (Object.keys(updateData).length > 0) {
            const { error: updateErr } = await supabase
                .from('applications')
                .update(updateData)
                .eq('id', app.id);

            if (updateErr) {
                console.error('[Dropbox Sign Webhook] Update error:', updateErr);
                return NextResponse.json(
                    { error: `Failed to update application: ${updateErr.message}` },
                    { status: 500 },
                );
            }

            console.log('[Dropbox Sign Webhook] Application updated:', {
                applicationId: app.id,
                oldStatus: app.status,
                newStatus,
            });
        }

        // 3. Success response (Dropbox Sign expects 200 OK within 5 seconds)
        return NextResponse.json({
            success: true,
            message: `Webhook processed for application ${app.id}`,
        });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('[Dropbox Sign Webhook] Error:', error);
        // Always return 200 so Dropbox Sign doesn't retry
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 200 },
        );
    }
}
