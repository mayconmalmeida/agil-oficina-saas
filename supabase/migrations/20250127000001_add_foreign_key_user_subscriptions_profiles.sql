-- Add foreign key constraint between user_subscriptions and profiles
-- This will enable proper joins between the tables

-- First, ensure that user_subscriptions.user_id references profiles.id
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT fk_user_subscriptions_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add index for better performance on joins
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- Update the RLS policies to ensure they work correctly with the foreign key
-- Drop existing admin policies and recreate them
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can update any subscription" ON public.user_subscriptions;

-- Recreate admin policies with proper foreign key reference
CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can update any subscription"
ON public.user_subscriptions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can insert any subscription"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);