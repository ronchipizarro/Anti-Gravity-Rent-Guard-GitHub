-- Migration: Add new statuses for the email-driven underwriting workflow
-- Run this against your Supabase database

-- Drop and recreate the status check constraint to allow new statuses
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
    'COSIGNER_SUBMITTED'
));
