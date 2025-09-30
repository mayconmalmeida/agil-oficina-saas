-- Script final para corrigir os preços dos planos
-- Execute este script no Supabase Dashboard SQL Editor

-- Primeiro, vamos ver o estado atual
SELECT 'Estado atual dos planos:' as info;
SELECT id, name, price, billing_cycle, affiliate_link, updated_at 
FROM plan_configurations 
ORDER BY id;

-- Desabilitar RLS temporariamente para esta operação
ALTER TABLE plan_configurations DISABLE ROW LEVEL SECURITY;

-- Atualizar os preços diretamente
UPDATE plan_configurations 
SET 
  name = 'Essencial Mensal',
  price = 197.90,
  affiliate_link = 'https://checkout.cackto.com.br/essencial/mensal',
  updated_at = NOW()
WHERE billing_cycle = 'mensal';

UPDATE plan_configurations 
SET 
  name = 'Premium Anual',
  price = 1970.00,
  affiliate_link = 'https://checkout.cackto.com.br/premium/anual',
  updated_at = NOW()
WHERE billing_cycle = 'anual';

-- Reabilitar RLS
ALTER TABLE plan_configurations ENABLE ROW LEVEL SECURITY;

-- Verificar as mudanças
SELECT 'Estado após atualização:' as info;
SELECT id, name, price, billing_cycle, affiliate_link, updated_at 
FROM plan_configurations 
ORDER BY id;

-- Confirmar se os preços estão corretos
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM plan_configurations WHERE billing_cycle = 'mensal' AND price = 197.90) 
    THEN '✅ Plano mensal: R$ 197,90 - CORRETO'
    ELSE '❌ Plano mensal: Preço incorreto'
  END as status_mensal,
  CASE 
    WHEN EXISTS (SELECT 1 FROM plan_configurations WHERE billing_cycle = 'anual' AND price = 1970.00) 
    THEN '✅ Plano anual: R$ 1.970,00 - CORRETO'
    ELSE '❌ Plano anual: Preço incorreto'
  END as status_anual;