
-- Corrigir a tabela user_subscriptions para não ter foreign key constraint problemática
-- e garantir que funcione tanto para assinaturas manuais quanto do Stripe

-- Primeiro, vamos remover a constraint problemática se existir
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;

-- Agora vamos garantir que a tabela está estruturada corretamente
-- Adicionar colunas necessárias para integração com Stripe
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);

-- Atualizar as políticas RLS para permitir inserção manual por admins
DROP POLICY IF EXISTS "Admins can insert any subscription" ON user_subscriptions;
CREATE POLICY "Admins can insert any subscription"
ON user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Política para edge functions poderem inserir assinaturas do Stripe
DROP POLICY IF EXISTS "Edge functions can insert subscriptions" ON user_subscriptions;
CREATE POLICY "Edge functions can insert subscriptions"
ON user_subscriptions
FOR INSERT
WITH CHECK (true);

-- Atualizar a função RPC para atualizar assinatura após pagamento
CREATE OR REPLACE FUNCTION update_subscription_after_payment(
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
  -- Calcular data de expiração baseada no tipo de plano
  IF p_plan_type LIKE '%_anual' THEN
    subscription_ends_at := now() + INTERVAL '1 year';
  ELSE
    subscription_ends_at := now() + INTERVAL '1 month';
  END IF;
  
  -- Inserir ou atualizar assinatura
  INSERT INTO user_subscriptions (
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
  UPDATE oficinas 
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
$$;
