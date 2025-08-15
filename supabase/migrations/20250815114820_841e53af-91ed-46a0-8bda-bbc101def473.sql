-- SECURITY FIX: Remove the insecure admins table and migrate to role-based authentication

-- First, migrate any existing admin data to profiles table (if needed)
-- This ensures no data is lost during the migration
INSERT INTO public.profiles (id, email, role, created_at)
SELECT 
  gen_random_uuid() as id,
  email,
  CASE 
    WHEN is_superadmin = true THEN 'superadmin'
    ELSE 'admin'
  END as role,
  created_at
FROM public.admins 
WHERE email NOT IN (SELECT email FROM public.profiles WHERE email IS NOT NULL)
ON CONFLICT (email) DO NOTHING;

-- Drop the insecure admins table completely
DROP TABLE IF EXISTS public.admins CASCADE;

-- Ensure profiles table has proper RLS policies for admin access
-- Allow admins to view other admin profiles for management purposes
CREATE POLICY "Admins can view other admin profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
  AND role IN ('admin', 'superadmin')
);

-- Allow superadmins to update admin roles
CREATE POLICY "Superadmins can manage admin roles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  )
  AND role IN ('admin', 'superadmin')
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  )
  AND role IN ('admin', 'superadmin')
);

-- Create a secure function to check admin status without exposing sensitive data
CREATE OR REPLACE FUNCTION public.is_user_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = user_email 
    AND role IN ('admin', 'superadmin')
  );
END;
$$;

-- Create a function to get admin role securely
CREATE OR REPLACE FUNCTION public.get_admin_role(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE email = user_email 
  AND role IN ('admin', 'superadmin');
  
  RETURN COALESCE(user_role, 'user');
END;
$$;