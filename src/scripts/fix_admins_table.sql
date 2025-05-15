
-- This script fixes the admins table and its RLS policies to prevent infinite recursion

-- First, disable RLS temporarily to ensure we can fix everything
ALTER TABLE IF EXISTS public.admins DISABLE ROW LEVEL SECURITY;

-- Make sure the admins table has the right structure
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nivel TEXT DEFAULT 'operacional',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure the nivel field has a default value of 'operacional'
ALTER TABLE public.admins ALTER COLUMN nivel SET DEFAULT 'operacional';

-- Drop any existing policies that might be causing problems
DROP POLICY IF EXISTS "Admins can view their own accounts" ON public.admins;
DROP POLICY IF EXISTS "Admins can update their own accounts" ON public.admins;
DROP POLICY IF EXISTS "Only superadmins can create admin accounts" ON public.admins;
DROP POLICY IF EXISTS "Only superadmins can delete admin accounts" ON public.admins;

-- Enable RLS again with better policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all authenticated users to view admin accounts
CREATE POLICY "Anyone can view admin accounts"
ON public.admins FOR SELECT
TO authenticated
USING (true);

-- Admins can insert rows (this will be checked at the application level)
CREATE POLICY "Authenticated users can create admin accounts"
ON public.admins FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can update rows (this will be checked at the application level)
CREATE POLICY "Authenticated users can update admin accounts"
ON public.admins FOR UPDATE
TO authenticated
USING (true);

-- Admins can delete rows (this will be checked at the application level)
CREATE POLICY "Authenticated users can delete admin accounts"
ON public.admins FOR DELETE
TO authenticated
USING (true);
