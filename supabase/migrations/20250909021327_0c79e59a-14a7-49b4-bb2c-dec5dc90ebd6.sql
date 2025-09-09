-- Fix critical security vulnerability: Admin table infinite recursion in RLS policies
-- This prevents unauthorized access to admin credentials

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view other admins" ON public.admins;
DROP POLICY IF EXISTS "Only active admins can view admin table" ON public.admins;
DROP POLICY IF EXISTS "Only superadmins can insert new admins" ON public.admins;
DROP POLICY IF EXISTS "Only superadmins can update admin records" ON public.admins;
DROP POLICY IF EXISTS "Only superadmins can delete admin records" ON public.admins;

-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admins 
    WHERE email = (auth.jwt() ->> 'email')
    AND is_active = true
  );
$$;

-- Create a security definer function to get current admin role
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role 
  FROM public.admins 
  WHERE email = (auth.jwt() ->> 'email')
  AND is_active = true
  LIMIT 1;
$$;

-- Create secure RLS policies using the security definer functions
CREATE POLICY "Secure admin view policy"
ON public.admins
FOR SELECT
TO authenticated
USING (public.is_current_user_admin());

CREATE POLICY "Secure admin insert policy"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_admin_role() = 'superadmin');

CREATE POLICY "Secure admin update policy"
ON public.admins
FOR UPDATE
TO authenticated
USING (public.get_current_admin_role() = 'superadmin');

CREATE POLICY "Secure admin delete policy"
ON public.admins
FOR DELETE
TO authenticated
USING (public.get_current_admin_role() = 'superadmin');