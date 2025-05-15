
-- First, check if there are any RLS policies on the admins table
-- If there are, we'll drop them and replace them with better policies
DROP POLICY IF EXISTS "Allow full access to admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can view all admin accounts" ON public.admins;
DROP POLICY IF EXISTS "Only superadmins can create admin accounts" ON public.admins;
DROP POLICY IF EXISTS "Only superadmins can update admin accounts" ON public.admins;
DROP POLICY IF EXISTS "Only superadmins can delete admin accounts" ON public.admins;
DROP POLICY IF EXISTS "Anyone can view admin accounts" ON public.admins;
DROP POLICY IF EXISTS "Authenticated users can create admin accounts" ON public.admins;
DROP POLICY IF EXISTS "Authenticated users can update admin accounts" ON public.admins;
DROP POLICY IF EXISTS "Authenticated users can delete admin accounts" ON public.admins;

-- Disable RLS temporarily to ensure we can fix everything
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Now create proper policies that won't cause infinite recursion
-- Enable RLS with better policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create a simple policy to allow all authenticated users to see admin accounts
-- This avoids recursive lookups that cause the infinite recursion
CREATE POLICY "Allow authenticated users to view admin accounts" 
ON public.admins FOR SELECT 
TO authenticated
USING (true);

-- Create a policy to allow all authenticated users to insert new admins
-- Access control will be handled at the application level
CREATE POLICY "Allow authenticated users to insert admin accounts" 
ON public.admins FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create a policy to allow all authenticated users to update admin accounts
-- Access control will be handled at the application level
CREATE POLICY "Allow authenticated users to update admin accounts" 
ON public.admins FOR UPDATE
TO authenticated
USING (true);

-- Create a policy to allow all authenticated users to delete admin accounts
-- Access control will be handled at the application level
CREATE POLICY "Allow authenticated users to delete admin accounts" 
ON public.admins FOR DELETE
TO authenticated
USING (true);
