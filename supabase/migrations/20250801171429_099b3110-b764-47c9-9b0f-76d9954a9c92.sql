
-- Atualizar a assinatura da oficina específica para plano premium com data limite
INSERT INTO user_subscriptions (
  user_id,
  plan_type,
  status,
  starts_at,
  ends_at,
  is_manual
) VALUES (
  '2e878bbe-23ce-4865-a7f1-bfc89889231c',
  'premium',
  'active',
  now(),
  '2026-08-28T23:59:59.999Z',
  true
)
ON CONFLICT (user_id) 
DO UPDATE SET
  plan_type = 'premium',
  status = 'active',
  starts_at = now(),
  ends_at = '2026-08-28T23:59:59.999Z',
  is_manual = true,
  updated_at = now();

-- Também atualizar a tabela profiles para garantir consistência
UPDATE profiles 
SET plano = 'Premium'
WHERE id = '2e878bbe-23ce-4865-a7f1-bfc89889231c';
