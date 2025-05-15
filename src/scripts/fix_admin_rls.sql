
-- First, check if there are any RLS policies on the admins table
-- If there are, we'll drop them and replace them with better policies
DROP POLICY IF EXISTS "Allow full access to admins" ON public.admins;

-- Disable RLS temporarily to ensure we can fix everything
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Now create proper policies that won't cause infinite recursion
-- Enable RLS with better policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated admins to see all admin accounts
CREATE POLICY "Admins can view all admin accounts" 
ON public.admins FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create a policy to allow only superadmins to insert new admins
CREATE POLICY "Only superadmins can create admin accounts" 
ON public.admins FOR INSERT 
WITH CHECK (
  (SELECT nivel FROM public.admins WHERE email = auth.email()) = 'superadmin'
);

-- Create a policy to allow only superadmins to update admin accounts
CREATE POLICY "Only superadmins can update admin accounts" 
ON public.admins FOR UPDATE 
USING (
  (SELECT nivel FROM public.admins WHERE email = auth.email()) = 'superadmin'
);

-- Create a policy to allow only superadmins to delete admin accounts
CREATE POLICY "Only superadmins can delete admin accounts" 
ON public.admins FOR DELETE 
USING (
  (SELECT nivel FROM public.admins WHERE email = auth.email()) = 'superadmin'
);
