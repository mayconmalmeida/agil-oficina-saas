-- Phase 1: Critical Security Fixes

-- 1. Add proper constraints for data isolation
ALTER TABLE public.clients 
ADD CONSTRAINT clients_oficina_id_not_null 
CHECK (oficina_id IS NOT NULL);

-- 2. Update existing client records to have proper oficina_id
UPDATE public.clients 
SET oficina_id = (
  SELECT id FROM public.oficinas 
  WHERE oficinas.user_id = clients.user_id 
  LIMIT 1
)
WHERE oficina_id IS NULL;

-- 3. Secure all database functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_subscription_after_payment(p_user_id uuid, p_plan_type text, p_stripe_customer_id text DEFAULT NULL::text, p_stripe_subscription_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  subscription_ends_at TIMESTAMP WITH TIME ZONE;
  result jsonb;
BEGIN
  -- Calcular data de expiração baseada no tipo de plano
  IF p_plan_type LIKE '%_anual' THEN
    subscription_ends_at := now() + INTERVAL '1 year';
  ELSE
    subscription_ends_at := now() + INTERVAL '1 month';
  END IF;
  
  -- Inserir ou atualizar assinatura
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    status,
    starts_at,
    ends_at,
    stripe_customer_id,
    stripe_subscription_id,
    is_manual
  ) VALUES (
    p_user_id,
    p_plan_type,
    'active',
    now(),
    subscription_ends_at,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    CASE WHEN p_stripe_customer_id IS NULL THEN true ELSE false END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = 'active',
    ends_at = EXCLUDED.ends_at,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    is_manual = EXCLUDED.is_manual,
    updated_at = now();
  
  -- Atualizar tabela oficinas se aplicável
  UPDATE public.oficinas 
  SET 
    plano = CASE 
      WHEN p_plan_type LIKE '%premium%' THEN 'Premium'
      WHEN p_plan_type LIKE '%essencial%' THEN 'Essencial'
      ELSE 'Essencial'
    END,
    is_active = true,
    trial_ends_at = CASE 
      WHEN p_plan_type LIKE '%trial%' THEN now() + INTERVAL '7 days'
      ELSE NULL
    END
  WHERE user_id = p_user_id;
  
  result := jsonb_build_object(
    'success', true,
    'plan_type', p_plan_type,
    'ends_at', subscription_ends_at
  );
  
  RETURN result;
END;
$function$;

-- 4. Remove dangerous admin creation RLS policy and replace with secure version
DROP POLICY IF EXISTS "Allow self-admin creation" ON public.admins;

-- Create secure admin management function
CREATE OR REPLACE FUNCTION public.create_admin_securely(p_email text, p_password text, p_is_superadmin boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  hashed_password text;
  new_admin_id uuid;
  result jsonb;
BEGIN
  -- Only superadmins can create new admins
  IF NOT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND is_superadmin = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Hash the password using pgcrypto
  SELECT crypt(p_password, gen_salt('bf', 12)) INTO hashed_password;
  
  -- Insert new admin
  INSERT INTO public.admins (email, password, is_superadmin)
  VALUES (p_email, hashed_password, p_is_superadmin)
  RETURNING id INTO new_admin_id;
  
  result := jsonb_build_object(
    'success', true,
    'admin_id', new_admin_id
  );
  
  RETURN result;
END;
$function$;

-- 5. Hash existing plain text passwords in admins table
UPDATE public.admins 
SET password = crypt(password, gen_salt('bf', 12))
WHERE password NOT LIKE '$2%';

-- 6. Add audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource text,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.security_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- 7. Add trigger to automatically set oficina_id for new clients
CREATE OR REPLACE FUNCTION public.set_client_oficina_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Automatically set oficina_id if not provided
  IF NEW.oficina_id IS NULL THEN
    SELECT id INTO NEW.oficina_id 
    FROM public.oficinas 
    WHERE user_id = NEW.user_id 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_client_oficina_id_trigger
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_client_oficina_id();