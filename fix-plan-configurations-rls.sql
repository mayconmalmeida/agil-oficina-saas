-- Fix RLS policies for plan_configurations table
-- This script should be executed in Supabase Dashboard SQL Editor

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'plan_configurations';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view plan configurations" ON plan_configurations;
DROP POLICY IF EXISTS "Only admins can modify plan configurations" ON plan_configurations;
DROP POLICY IF EXISTS "plan_configurations_select_policy" ON plan_configurations;
DROP POLICY IF EXISTS "plan_configurations_update_policy" ON plan_configurations;
DROP POLICY IF EXISTS "plan_configurations_insert_policy" ON plan_configurations;

-- Create new policies that allow proper access
-- Allow anyone to read plan configurations (needed for public pricing pages)
CREATE POLICY "Allow public read access to plan configurations"
ON plan_configurations FOR SELECT
USING (true);

-- Allow service role to modify plan configurations (for admin operations)
CREATE POLICY "Allow service role full access to plan configurations"
ON plan_configurations FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow authenticated users with admin role to modify
CREATE POLICY "Allow admin users to modify plan configurations"
ON plan_configurations FOR ALL
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Enable RLS on the table
ALTER TABLE plan_configurations ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON plan_configurations TO anon;
GRANT ALL ON plan_configurations TO authenticated;
GRANT ALL ON plan_configurations TO service_role;

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'plan_configurations';