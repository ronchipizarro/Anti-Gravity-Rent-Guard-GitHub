-- Initial schema for RentGuard Applications

-- 1. Applications table
-- 1. Applications table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  owner_data jsonb,
  tenant_data jsonb,
  status text check (status in ('PENDING_TENANT', 'SUBMITTED', 'COMPLETED_UNDERWRITING', 'APPROVED', 'REJECTED')),
  decision jsonb,
  invite_only boolean default false,
  documents jsonb
);

-- Enable RLS on applications table
alter table public.applications enable row level security;

-- Policy to allow anonymous insertions (MVP)
create policy "Enable insert for anonymous users"
on public.applications for insert
with check (true);

-- Policy to allow anonymous selection (so tenants can find their app)
create policy "Enable select for anonymous users"
on public.applications for select
using (true);

-- Policy to allow anonymous updates (so tenants can finish app)
create policy "Enable update for anonymous users"
on public.applications for update
using (true);

-- 2. Storage Buckets & Policies
-- Note: Create the 'documents' bucket in the Supabase UI first as 'Public'
-- Then run these policies to allow uploads:

create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'documents' );

create policy "Public Select"
  on storage.objects for select
  using ( bucket_id = 'documents' );
