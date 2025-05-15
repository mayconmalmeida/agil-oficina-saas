
-- Fix the admins table so that both the password and nivel/is_superadmin field are properly set up

-- First disable RLS to make changes
ALTER TABLE IF EXISTS public.admins DISABLE ROW LEVEL SECURITY;

-- Check if nivel column exists and rename it to is_superadmin if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admins' 
        AND column_name = 'nivel'
    ) THEN
        -- Rename nivel to is_superadmin
        ALTER TABLE public.admins RENAME COLUMN nivel TO is_superadmin;
        
        -- Convert text values to boolean
        UPDATE public.admins SET is_superadmin = 
            CASE 
                WHEN is_superadmin::text = 'superadmin' THEN true
                ELSE false
            END;
            
        -- Change column type to boolean
        ALTER TABLE public.admins ALTER COLUMN is_superadmin TYPE boolean USING is_superadmin::boolean;
        ALTER TABLE public.admins ALTER COLUMN is_superadmin SET DEFAULT false;
    END IF;
END $$;

-- Make sure the password field exists and is required
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admins' 
        AND column_name = 'password'
    ) THEN
        -- Add password field if it doesn't exist
        ALTER TABLE public.admins ADD COLUMN password TEXT NOT NULL DEFAULT 'changeme';
    END IF;
END $$;

-- Re-enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies for admins table
DROP POLICY IF EXISTS "Allow authenticated admin to read own data" ON public.admins;
DROP POLICY IF EXISTS "Allow self-admin creation" ON public.admins;
DROP POLICY IF EXISTS "Allow update on own admin data" ON public.admins;

-- Create simple RLS policy that allows authenticated users to view admins
CREATE POLICY "Allow authenticated users to view all admins" 
  ON public.admins 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create simple RLS policy that allows authenticated users to insert into admins
CREATE POLICY "Allow authenticated users to insert admins" 
  ON public.admins 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Create simple RLS policy that allows authenticated users to update admins
CREATE POLICY "Allow authenticated users to update admins" 
  ON public.admins 
  FOR UPDATE 
  TO authenticated 
  USING (true);
