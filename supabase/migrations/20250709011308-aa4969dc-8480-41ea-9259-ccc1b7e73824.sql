-- Sincronizar dados existentes de profiles para oficinas
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
  p.id,
  p.nome_oficina,
  p.cnpj,
  p.telefone,
  p.email,
  p.responsavel,
  p.created_at,
  COALESCE(p.is_active, true),
  COALESCE(p.is_active, true),
  p.trial_ends_at,
  COALESCE(p.plano, 'Essencial'),
  p.logo_url,
  p.endereco,
  p.cidade,
  p.estado,
  p.cep
FROM public.profiles p
WHERE p.role = 'oficina' 
AND NOT EXISTS (
  SELECT 1 FROM public.oficinas o 
  WHERE o.user_id = p.id
);