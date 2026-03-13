-- Migration: Add post-approval workflow statuses
-- CONTRACT_SENT, CONTRACT_SIGNED, PAYMENT_PENDING, ACTIVE

ALTER TABLE public.applications
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check
CHECK (status IN (
    'PENDING_TENANT',
    'SUBMITTED',
    'PENDING_REVIEW',
    'COMPLETED_UNDERWRITING',
    'APPROVED',
    'REJECTED',
    'PENDING_COSIGNER',
    'PENDING_COSIGNER_DOCS',
    'COSIGNER_SUBMITTED',
    'CONTRACT_SENT',
    'CONTRACT_SIGNED',
    'PAYMENT_PENDING',
    'ACTIVE'
));
