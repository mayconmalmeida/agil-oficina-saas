
-- Criar uma assinatura ativa manual para o usuário de teste
INSERT INTO public.user_subscriptions (
  user_id,
  plan_type,
  status,
  starts_at,
  ends_at,
  is_manual
) VALUES (
  '307c8e18-7d29-413a-9b28-0cf18df2aed8',
  'essencial_anual',
  'active',
  now(),
  now() + INTERVAL '1 year',
  true
) ON CONFLICT (user_id) DO UPDATE SET
  plan_type = EXCLUDED.plan_type,
  status = 'active',
  ends_at = EXCLUDED.ends_at,
  is_manual = true,
  updated_at = now();
