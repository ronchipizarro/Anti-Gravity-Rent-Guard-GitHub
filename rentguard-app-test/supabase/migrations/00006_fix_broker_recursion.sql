-- Migration 00006: Fix Broker Recursion
-- This migration fixes the 'infinite recursion detected in policy' error for the brokers table
-- by using a security definer function to bypass RLS for the lookup.

-- 1. Create a helper function to get the current user's broker ID safely
CREATE OR REPLACE FUNCTION public.get_my_broker_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.brokers WHERE user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS brokers_select_children ON brokers;
DROP POLICY IF EXISTS properties_select_own ON properties;
DROP POLICY IF EXISTS properties_insert ON properties;
DROP POLICY IF EXISTS properties_update_own ON properties;
DROP POLICY IF EXISTS properties_delete_own ON properties;
DROP POLICY IF EXISTS properties_select_children ON properties;
DROP POLICY IF EXISTS invitations_select_own ON invitations;
DROP POLICY IF EXISTS invitations_insert ON invitations;
DROP POLICY IF EXISTS invitations_update_own ON invitations;
-- Also clear old applications policy if it exists
DROP POLICY IF EXISTS applications_select_broker ON applications;

-- 3. Create non-recursive policies for Brokers
-- Brokers can see their child realtors
CREATE POLICY brokers_select_children ON brokers FOR SELECT USING (
    parent_broker_id = public.get_my_broker_id()
);

-- 4. Create non-recursive policies for Properties
-- Broker can CRUD their own properties
CREATE POLICY properties_select_own ON properties FOR SELECT USING (
    broker_id = public.get_my_broker_id()
);
CREATE POLICY properties_insert ON properties FOR INSERT WITH CHECK (
    broker_id = public.get_my_broker_id()
);
CREATE POLICY properties_update_own ON properties FOR UPDATE USING (
    broker_id = public.get_my_broker_id()
);
CREATE POLICY properties_delete_own ON properties FOR DELETE USING (
    broker_id = public.get_my_broker_id()
);

-- Brokers can see their child realtors' properties
CREATE POLICY properties_select_children ON properties FOR SELECT USING (
    broker_id IN (
        SELECT id FROM brokers WHERE parent_broker_id = public.get_my_broker_id()
    )
);

-- 5. Create non-recursive policies for Invitations
CREATE POLICY invitations_all_access ON invitations FOR ALL USING (
    broker_id = public.get_my_broker_id()
);

-- 6. Create non-recursive policies for Applications
-- Brokers can see applications linked to them
CREATE POLICY applications_select_broker ON applications FOR SELECT USING (
    broker_id = public.get_my_broker_id()
);
