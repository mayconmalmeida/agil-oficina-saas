-- 1. Inserir planos pré-cadastrados na tabela plan_configurations
INSERT INTO public.plan_configurations (
  plan_type,
  billing_cycle,
  name,
  price,
  currency,
  features,
  is_active,
  display_order,
  affiliate_link
) VALUES 
-- Plano Essencial
(
  'essencial',
  'mensal',
  'Essencial Mensal',
  89.90,
  'BRL',
  '["Cadastro de clientes ilimitado", "Gestão de orçamentos", "Controle de serviços", "Relatórios básicos", "Suporte via e-mail"]'::jsonb,
  true,
  1,
  'https://checkout.cackto.com.br/essencial/mensal'
),
(
  'essencial',
  'anual', 
  'Essencial Anual',
  899.00,
  'BRL',
  '["Cadastro de clientes ilimitado", "Gestão de orçamentos", "Controle de serviços", "Relatórios básicos", "Suporte via e-mail"]'::jsonb,
  true,
  2,
  'https://checkout.cackto.com.br/essencial/anual'
),
-- Plano Premium
(
  'premium',
  'mensal',
  'Premium Mensal', 
  179.90,
  'BRL',
  '["Todos os recursos do plano Essencial", "Módulo de estoque integrado", "Agendamento de serviços", "Relatórios avançados", "Suporte prioritário", "Backup automático"]'::jsonb,
  true,
  3,
  'https://checkout.cackto.com.br/premium/mensal'
),
(
  'premium',
  'anual',
  'Premium Anual',
  1799.00, 
  'BRL',
  '["Todos os recursos do plano Essencial", "Módulo de estoque integrado", "Agendamento de serviços", "Relatórios avançados", "Suporte prioritário", "Backup automático"]'::jsonb,
  true,
  4,
  'https://checkout.cackto.com.br/premium/anual'
)
ON CONFLICT (plan_type, billing_cycle) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  affiliate_link = EXCLUDED.affiliate_link,
  updated_at = now();

-- 2. Mover os dois registros específicos da tabela clients para oficinas
INSERT INTO public.oficinas (
  id,
  user_id,
  nome_oficina,
  cnpj,
  telefone,
  email,
  responsavel,
  created_at,
  is_active,
  ativo,
  trial_ends_at,
  plano,
  logo_url,
  endereco,
  cidade,
  estado,
  cep
)
SELECT 
  gen_random_uuid(),
  c.id, -- usar o id do client como user_id na oficina
  c.nome,
  c.documento,
  c.telefone,
  c.email,
  c.nome, -- usar nome como responsável
  c.created_at,
  COALESCE(c.is_active, true),
  COALESCE(c.is_active, true),
  NULL, -- trial_ends_at
  'Essencial', -- plano padrão
  NULL, -- logo_url
  c.endereco,
  c.cidade,
  c.estado,
  c.cep
FROM public.clients c
WHERE c.id IN ('0e943eb0-6447-413f-bf61-00fff2c60f06', '2e878bbe-23ce-4865-a7f1-bfc89889231c')
ON CONFLICT (user_id) DO NOTHING;

-- 3. Remover os registros da tabela clients
DELETE FROM public.clients 
WHERE id IN ('0e943eb0-6447-413f-bf61-00fff2c60f06', '2e878bbe-23ce-4865-a7f1-bfc89889231c');