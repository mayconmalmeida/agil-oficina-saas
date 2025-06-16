
-- Deletar todos os dados das tabelas, preservando apenas os dados de admin

-- Desabilitar verificações de chave estrangeira temporariamente
SET session_replication_role = replica;

-- Deletar dados das tabelas (exceto admins)
DELETE FROM public.user_subscriptions;
DELETE FROM public.subscriptions;
DELETE FROM public.services;
DELETE FROM public.orcamentos;
DELETE FROM public.onboarding_status;
DELETE FROM public.oficinas;
DELETE FROM public.clients;
DELETE FROM public.profiles;
DELETE FROM public.plan_configurations;

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = DEFAULT;

-- Resetar sequences se necessário
SELECT setval(pg_get_serial_sequence('public.plan_configurations', 'display_order'), 1, false);
