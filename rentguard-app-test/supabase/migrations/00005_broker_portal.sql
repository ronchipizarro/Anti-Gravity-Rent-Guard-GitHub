-- Migration 00005: Broker Portal
-- Creates brokers, properties, and invitations tables for the multi-role portal

-- ============================================================
-- 1. BROKERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('broker', 'realtor', 'owner')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    license_id TEXT,
    brokerage_name TEXT,
    brokerage_license TEXT,
    parent_broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id),
    UNIQUE(email)
);

CREATE INDEX idx_brokers_user_id ON brokers(user_id);
CREATE INDEX idx_brokers_parent_broker_id ON brokers(parent_broker_id);

-- ============================================================
-- 2. PROPERTIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    property_type TEXT NOT NULL CHECK (property_type IN (
        'house', 'townhome', 'apartment_condo', 'commercial', 'multi_family', 'apartment_building'
    )),
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Miami',
    state TEXT NOT NULL DEFAULT 'FL',
    zip TEXT NOT NULL,
    floor TEXT,
    unit_number TEXT,
    bedrooms INTEGER,
    monthly_rent NUMERIC(10,2) NOT NULL,
    lease_duration_months INTEGER NOT NULL DEFAULT 12,
    lease_status TEXT NOT NULL DEFAULT 'new' CHECK (lease_status IN ('new', 'ongoing')),
    fee_payer TEXT NOT NULL DEFAULT 'owner' CHECK (fee_payer IN ('broker', 'owner', 'renter')),
    -- LLC fields
    is_llc BOOLEAN NOT NULL DEFAULT false,
    llc_name TEXT,
    llc_address TEXT,
    llc_rep_name TEXT,
    llc_rep_email TEXT,
    -- Owner fields
    has_owner_info BOOLEAN NOT NULL DEFAULT false,
    owner_name TEXT,
    owner_email TEXT,
    owner_phone TEXT,
    -- Property Manager fields
    is_broker_pm BOOLEAN NOT NULL DEFAULT false,
    has_pm BOOLEAN NOT NULL DEFAULT false,
    pm_name TEXT,
    pm_email TEXT,
    pm_will_sign BOOLEAN DEFAULT false,
    -- Status pipeline
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN (
        'enrolled', 'invitations_sent', 'tenant_applied', 'under_review',
        'approved', 'contract_sent', 'contract_signed', 'payment_pending',
        'active', 'rejected'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_broker_id ON properties(broker_id);
CREATE INDEX idx_properties_status ON properties(status);

-- ============================================================
-- 3. INVITATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    renter_name TEXT NOT NULL,
    renter_email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'renter' CHECK (role IN (
        'renter', 'co_renter', 'owner', 'broker', 'realtor'
    )),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'accepted', 'expired', 'declined'
    )),
    application_id UUID,
    invite_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_property_id ON invitations(property_id);
CREATE INDEX idx_invitations_broker_id ON invitations(broker_id);
CREATE INDEX idx_invitations_invite_token ON invitations(invite_token);

-- ============================================================
-- 4. ALTER APPLICATIONS TABLE (add broker/property links)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'broker_id') THEN
        ALTER TABLE applications ADD COLUMN broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'property_id') THEN
        ALTER TABLE applications ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'invitation_id') THEN
        ALTER TABLE applications ADD COLUMN invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_applications_broker_id ON applications(broker_id);

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Brokers: users can read/update their own row; authenticated users can insert
CREATE POLICY brokers_select_own ON brokers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY brokers_insert ON brokers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY brokers_update_own ON brokers FOR UPDATE USING (auth.uid() = user_id);

-- Brokers: brokers can also read their child realtors
CREATE POLICY brokers_select_children ON brokers FOR SELECT USING (
    parent_broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);

-- Properties: broker can CRUD their own properties
CREATE POLICY properties_select_own ON properties FOR SELECT USING (
    broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);
CREATE POLICY properties_insert ON properties FOR INSERT WITH CHECK (
    broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);
CREATE POLICY properties_update_own ON properties FOR UPDATE USING (
    broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);
CREATE POLICY properties_delete_own ON properties FOR DELETE USING (
    broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);

-- Properties: brokers can also see their child realtors' properties
CREATE POLICY properties_select_children ON properties FOR SELECT USING (
    broker_id IN (
        SELECT id FROM brokers WHERE parent_broker_id IN (
            SELECT id FROM brokers WHERE user_id = auth.uid()
        )
    )
);

-- Invitations: broker can CRUD their own invitations
CREATE POLICY invitations_select_own ON invitations FOR SELECT USING (
    broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);
CREATE POLICY invitations_insert ON invitations FOR INSERT WITH CHECK (
    broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);
CREATE POLICY invitations_update_own ON invitations FOR UPDATE USING (
    broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);

-- Applications: brokers can see applications linked to them
CREATE POLICY applications_select_broker ON applications FOR SELECT USING (
    broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);
