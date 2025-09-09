-- Fix critical security vulnerability: Admin table infinite recursion in RLS policies
-- This prevents unauthorized access to admin credentials

-- First, drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view other admins" ON public.admins;

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
CREATE POLICY "Only active admins can view admin table"
ON public.admins
FOR SELECT
TO authenticated
USING (public.is_current_user_admin());

CREATE POLICY "Only superadmins can insert new admins"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_admin_role() = 'superadmin');

CREATE POLICY "Only superadmins can update admin records"
ON public.admins
FOR UPDATE
TO authenticated
USING (public.get_current_admin_role() = 'superadmin');

CREATE POLICY "Only superadmins can delete admin records"
ON public.admins
FOR DELETE
TO authenticated
USING (public.get_current_admin_role() = 'superadmin');

-- Additional security: Create an audit log function for admin actions
CREATE OR REPLACE FUNCTION public.log_admin_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log admin access attempts (you can extend this to write to an audit table)
  RAISE LOG 'Admin table accessed by user: %', (auth.jwt() ->> 'email');
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging
CREATE TRIGGER admin_access_audit
  AFTER SELECT ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_access();