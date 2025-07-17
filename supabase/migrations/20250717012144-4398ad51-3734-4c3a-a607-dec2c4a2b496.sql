
-- Função para criar assinatura manual (admin)
CREATE OR REPLACE FUNCTION create_manual_subscription(
  p_user_id UUID,
  p_plan_type TEXT,
  p_amount DECIMAL DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
  
  -- Inserir assinatura manual
  INSERT INTO user_subscriptions (
    user_id,
    plan_type,
    status,
    starts_at,
    ends_at,
    is_manual
  ) VALUES (
    p_user_id,
    p_plan_type,
    'active',
    now(),
    subscription_ends_at,
    true
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = 'active',
    ends_at = EXCLUDED.ends_at,
    is_manual = true,
    updated_at = now();
  
  result := jsonb_build_object(
    'success', true,
    'plan_type', p_plan_type,
    'ends_at', subscription_ends_at,
    'is_manual', true
  );
  
  RETURN result;
END;
$$;
