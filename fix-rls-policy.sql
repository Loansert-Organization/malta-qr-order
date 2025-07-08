-- Fix Row Level Security Policy for Bars Table
-- This script will allow inserts from the public API key

-- First, let's check the current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bars';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'bars';

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON bars;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bars;
DROP POLICY IF EXISTS "Enable update for users based on email" ON bars;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON bars;

-- Create a new policy that allows all operations for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON bars
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create a policy that allows all operations for the service role
CREATE POLICY "Enable all access for service role" ON bars
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create a policy that allows public read access
CREATE POLICY "Enable read access for all users" ON bars
    FOR SELECT
    TO public
    USING (true);

-- Create a policy that allows public insert access (for onboarding)
CREATE POLICY "Enable insert access for public" ON bars
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'bars';

-- Test insert (optional - uncomment to test)
-- INSERT INTO bars (name, city, country) VALUES ('TEST BAR', 'Test City', 'Malta') RETURNING id; 