import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/payments/create-link
 *
 * Triggered by underwriter clicking "Request Payment" on an approved application
 * - Requires CONTRACT_SIGNED status (contracts already signed)
 * - Creates Stripe Payment Link for fee collection
 * - Updates application: status → PAYMENT_PENDING, stores stripe_payment_link
 *
 * PHASE 2: Stripe keys placeholder
 * TODO: Obtain STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
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

        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase not configured' },
                { status: 500 },
            );
        }

        // 1. Fetch application
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

        // 2. Validate status (must be CONTRACT_SIGNED)
        if (app.status !== 'CONTRACT_SIGNED') {
            return NextResponse.json(
                {
                    error: `Cannot request payment in ${app.status} status. Contracts must be signed first.`,
                },
                { status: 400 },
            );
        }

        // 3. Check for Stripe secret key (if missing, return test placeholder)
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
            // For MVP: return a test placeholder URL instead of failing
            const testPaymentLink = `https://pay.stripe.com/placeholder?amount=${app.fee_monthly || 150}&currency=usd&application=${applicationId}`;

            // Update application with test link
            await supabase
                .from('applications')
                .update({
                    status: 'PAYMENT_PENDING',
                    stripe_payment_link: testPaymentLink,
                })
                .eq('id', applicationId);

            return NextResponse.json({
                success: true,
                message: 'Payment link created (test mode)',
                payment_link: testPaymentLink,
                amount_cents: Math.round((app.fee_monthly || 150) * 100),
                is_test: true,
            });
        }

        // 4. TODO: Create Stripe Payment Link (when key is available)
        // const stripe = new Stripe(stripeKey);
        // const link = await stripe.paymentLinks.create({
        //   line_items: [{
        //     price_data: {
        //       currency: 'usd',
        //       product_data: { name: 'RentGuard Protection Fee' },
        //       unit_amount: Math.round(app.fee_monthly * 100),
        //     },
        //     quantity: 1,
        //   }],
        //   metadata: { application_id: applicationId },
        // });

        // For now, return placeholder
        const placeholderLink = `https://pay.stripe.com/placeholder?app=${applicationId}`;

        const { error: updateErr } = await supabase
            .from('applications')
            .update({
                status: 'PAYMENT_PENDING',
                stripe_payment_link: placeholderLink,
            })
            .eq('id', applicationId);

        if (updateErr) {
            return NextResponse.json(
                { error: `Failed to update application: ${updateErr.message}` },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payment link created',
            payment_link: placeholderLink,
            amount_cents: Math.round((app.fee_monthly || 150) * 100),
            is_test: true,
        });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Create Payment Link Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 },
        );
    }
}
