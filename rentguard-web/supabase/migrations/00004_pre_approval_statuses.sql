-- Migration 00004: Add pre-approval and document workflow statuses
-- PRE_APPROVED, PENDING_UNDERWRITER_REVIEW, REQUIRES_COSIGNER, PENDING_DOCUMENTS

ALTER TABLE public.applications
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check
CHECK (status IN (
    'PENDING_TENANT',
    'SUBMITTED',
    'PENDING_REVIEW',
    'COMPLETED_UNDERWRITING',
    -- Pre-approval flow (Phase 2)
    'PRE_APPROVED',
    'PENDING_UNDERWRITER_REVIEW',
    'REQUIRES_COSIGNER',
    'PENDING_DOCUMENTS',
    -- Final decisions
    'APPROVED',
    'REJECTED',
    -- Cosigner flow
    'PENDING_COSIGNER',
    'PENDING_COSIGNER_DOCS',
    'COSIGNER_SUBMITTED',
    -- Post-approval workflow
    'CONTRACT_SENT',
    'CONTRACT_SIGNED',
    'PAYMENT_PENDING',
    'ACTIVE'
));

-- Add fee tracking columns to applications table
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS fee_percentage NUMERIC(5,4),  -- e.g. 0.0500 = 5%
ADD COLUMN IF NOT EXISTS fee_monthly    NUMERIC(10,2), -- calculated monthly fee in USD
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10,2), -- optional deposit amount in USD
ADD COLUMN IF NOT EXISTS dropbox_sign_request_id TEXT, -- Dropbox Sign envelope ID
ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT;      -- Stripe payment link URL
