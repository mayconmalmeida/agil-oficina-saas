
-- Atualizar a função RPC para garantir persistência correta em user_subscriptions
CREATE OR REPLACE FUNCTION public.update_subscription_after_payment(
  p_user_id UUID, 
  p_plan_type TEXT,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_stripe_subscription_id TEXT DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  subscription_ends_at TIMESTAMP WITH TIME ZONE;
  result jsonb;
BEGIN
  -- Log da função
  RAISE LOG 'update_subscription_after_payment called: user_id=%, plan_type=%, stripe_customer=%, stripe_subscription=%', 
    p_user_id, p_plan_type, p_stripe_customer_id, p_stripe_subscription_id;

  -- Calcular data de expiração baseada no tipo de plano
  IF p_plan_type LIKE '%_anual' THEN
    subscription_ends_at := now() + INTERVAL '1 year';
  ELSE
    subscription_ends_at := now() + INTERVAL '1 month';
  END IF;
  
  -- ✅ Inserir ou atualizar assinatura em user_subscriptions com UPSERT
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    status,
    starts_at,
    ends_at,
    trial_ends_at,
    stripe_customer_id,
    stripe_subscription_id,
    is_manual,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_plan_type,
    'active',
    now(),
    subscription_ends_at,
    subscription_ends_at, -- Para assinaturas ativas, trial_ends_at = ends_at
    p_stripe_customer_id,
    p_stripe_subscription_id,
    CASE WHEN p_stripe_customer_id IS NULL THEN true ELSE false END,
    now(),
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = EXCLUDED.status,
    ends_at = EXCLUDED.ends_at,
    trial_ends_at = EXCLUDED.trial_ends_at,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    is_manual = EXCLUDED.is_manual,
    updated_at = now();
  
  RAISE LOG 'user_subscriptions updated successfully for user_id=%', p_user_id;
  
  -- ✅ Atualizar tabela oficinas se aplicável
  UPDATE public.oficinas 
  SET 
    plano = CASE 
      WHEN p_plan_type LIKE '%premium%' THEN 'Premium'
      WHEN p_plan_type LIKE '%essencial%' THEN 'Essencial'
      ELSE 'Essencial'
    END,
    is_active = true,
    trial_ends_at = subscription_ends_at
  WHERE user_id = p_user_id;
  
  RAISE LOG 'oficinas updated successfully for user_id=%', p_user_id;
  
  result := jsonb_build_object(
    'success', true,
    'plan_type', p_plan_type,
    'ends_at', subscription_ends_at,
    'trial_ends_at', subscription_ends_at
  );
  
  RETURN result;
END;
$$;
