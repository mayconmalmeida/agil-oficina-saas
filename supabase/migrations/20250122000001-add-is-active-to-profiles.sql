-- Add is_active column to profiles table for admin workshop management
-- This allows admins to block/unblock workshops

-- Add the is_active column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create an index for better performance on queries filtering by is_active
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Update existing profiles to be active by default
UPDATE public.profiles 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN public.profiles.is_active IS 'Indicates if the workshop/profile is active and can access the system';