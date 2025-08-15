-- SECURITY FIX: Remove the insecure admins table and migrate to role-based authentication

-- First, check if we need to migrate any admin data to profiles
-- Only insert if the admin email doesn't already exist in profiles
DO $$
DECLARE
    admin_rec RECORD;
BEGIN
    -- Loop through admins and create profiles for those that don't exist
    FOR admin_rec IN 
        SELECT email, is_superadmin, created_at 
        FROM public.admins 
        WHERE email IS NOT NULL
    LOOP
        -- Check if profile already exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = admin_rec.email) THEN
            INSERT INTO public.profiles (id, email, role, created_at)
            VALUES (
                gen_random_uuid(),
                admin_rec.email,
                CASE 
                    WHEN admin_rec.is_superadmin = true THEN 'superadmin'
                    ELSE 'admin'
                END,
                admin_rec.created_at
            );
        END IF;
    END LOOP;
END $$;

-- Drop the insecure admins table completely
DROP TABLE IF EXISTS public.admins CASCADE;

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