-- Atualizar preços dos planos Premium conforme especificação
-- Mensal: R$ 197,00 | Anual: R$ 1.970,00

UPDATE public.plan_configurations 
SET 
  price = 197.00,
  updated_at = NOW()
WHERE plan_type = 'premium' AND billing_cycle = 'mensal';

UPDATE public.plan_configurations 
SET 
  price = 1970.00,
  updated_at = NOW()
WHERE plan_type = 'premium' AND billing_cycle = 'anual';

-- Verificar se as atualizações foram aplicadas corretamente
SELECT 
  plan_type,
  billing_cycle,
  name,
  price,
  currency,
  updated_at
FROM public.plan_configurations 
WHERE plan_type = 'premium'
ORDER BY billing_cycle;