
-- Remover configurações de planos desnecessários (Essencial e Enterprise)
DELETE FROM plan_configurations 
WHERE plan_type IN ('essencial', 'enterprise');

-- Atualizar assinaturas existentes de Essencial para Premium
UPDATE user_subscriptions 
SET plan_type = CASE 
  WHEN plan_type = 'essencial_mensal' THEN 'premium_mensal'
  WHEN plan_type = 'essencial_anual' THEN 'premium_anual'
  WHEN plan_type = 'free_trial_essencial' THEN 'free_trial_premium'
  ELSE plan_type
END
WHERE plan_type IN ('essencial_mensal', 'essencial_anual', 'free_trial_essencial');

-- Atualizar planos na tabela oficinas
UPDATE oficinas 
SET plano = 'Premium' 
WHERE plano IN ('Essencial', 'Enterprise');

-- Atualizar planos na tabela profiles
UPDATE profiles 
SET plano = 'Premium' 
WHERE plano IN ('Essencial', 'Enterprise');
