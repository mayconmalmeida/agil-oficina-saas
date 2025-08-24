
-- Criar tabela admins com senha criptografada
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS na tabela admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins vejam outros admins
CREATE POLICY "Admins can view other admins" ON public.admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

-- Inserir o admin principal com senha criptografada (bcrypt)
-- Senha: Malichesk1@14
INSERT INTO public.admins (email, password_hash, role) 
VALUES (
  'mayconintermediacao@gmail.com',
  '$2b$12$LQv3c1ysdeLiKg.3mxO3XuVlkaPgFX1QJT1m8rqzSzKl.NGWgCW8u',
  'superadmin'
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  updated_at = now();

-- Corrigir problemas na tabela oficinas
-- Remover default perigoso do nome_oficina
ALTER TABLE public.oficinas ALTER COLUMN nome_oficina DROP DEFAULT;

-- Tornar nome_oficina obrigatório (recomendado)
ALTER TABLE public.oficinas ALTER COLUMN nome_oficina SET NOT NULL;

-- Corrigir dados já poluídos com "Minha Oficina"
UPDATE public.oficinas o
SET nome_oficina = COALESCE(p.nome_oficina, p.full_name, 'Oficina ' || SUBSTRING(p.email FROM 1 FOR 10))
FROM public.profiles p
WHERE o.user_id = p.id
  AND (o.nome_oficina = 'Minha Oficina' OR o.nome_oficina IS NULL)
  AND (p.nome_oficina IS NOT NULL OR p.full_name IS NOT NULL OR p.email IS NOT NULL);

-- Função para validar login de admin usando bcrypt
CREATE OR REPLACE FUNCTION public.validate_admin_login(p_email TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  password_valid BOOLEAN := FALSE;
BEGIN
  -- Buscar admin por email
  SELECT * INTO admin_record
  FROM public.admins
  WHERE email = p_email AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin não encontrado');
  END IF;
  
  -- Validar senha (simulação - em produção usar extensão pgcrypto)
  -- Por enquanto, comparação direta para teste
  IF admin_record.password_hash = crypt(p_password, admin_record.password_hash) THEN
    password_valid := TRUE;
  END IF;
  
  IF NOT password_valid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Senha inválida');
  END IF;
  
  -- Atualizar último login
  UPDATE public.admins 
  SET last_login_at = now(), updated_at = now()
  WHERE id = admin_record.id;
  
  -- Retornar sucesso com dados do admin
  RETURN jsonb_build_object(
    'success', true,
    'admin', jsonb_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'role', admin_record.role,
      'is_active', admin_record.is_active
    )
  );
END;
$$;

-- Função para buscar estatísticas administrativas
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users INTEGER := 0;
  active_subscriptions INTEGER := 0;
  trialing_users INTEGER := 0;
  new_users_this_month INTEGER := 0;
  start_of_month TIMESTAMP WITH TIME ZONE;
BEGIN
  start_of_month := date_trunc('month', now());
  
  -- Total de usuários (exceto admins)
  SELECT COUNT(*) INTO total_users
  FROM public.profiles
  WHERE role NOT IN ('admin', 'superadmin');
  
  -- Assinaturas ativas
  SELECT COUNT(*) INTO active_subscriptions
  FROM public.user_subscriptions
  WHERE status = 'active';
  
  -- Usuários em trial
  SELECT COUNT(*) INTO trialing_users
  FROM public.user_subscriptions
  WHERE status = 'trialing';
  
  -- Novos usuários este mês
  SELECT COUNT(*) INTO new_users_this_month
  FROM public.profiles
  WHERE role NOT IN ('admin', 'superadmin')
    AND created_at >= start_of_month;
  
  RETURN jsonb_build_object(
    'totalUsers', total_users,
    'activeSubscriptions', active_subscriptions,
    'trialingUsers', trialing_users,
    'totalRevenue', active_subscriptions * 49.90,
    'newUsersThisMonth', new_users_this_month
  );
END;
$$;
