-- Adicionar campos que podem estar faltando na tabela oficinas para compatibilidade
ALTER TABLE public.oficinas 
ADD COLUMN IF NOT EXISTS responsavel text,
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS plano text DEFAULT 'Essencial',
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS cep text;

-- Criar função para sincronizar dados entre profiles e oficinas quando uma oficina for cadastrada
CREATE OR REPLACE FUNCTION public.sync_profile_to_oficina()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando um profile com role 'oficina' for criado/atualizado, sincronizar com a tabela oficinas
  IF NEW.role = 'oficina' THEN
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
    ) VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.nome_oficina,
      NEW.cnpj,
      NEW.telefone,
      NEW.email,
      NEW.responsavel,
      NEW.created_at,
      COALESCE(NEW.is_active, true),
      COALESCE(NEW.is_active, true),
      NEW.trial_ends_at,
      COALESCE(NEW.plano, 'Essencial'),
      NEW.logo_url,
      NEW.endereco,
      NEW.cidade,
      NEW.estado,
      NEW.cep
    )
    ON CONFLICT (user_id) DO UPDATE SET
      nome_oficina = EXCLUDED.nome_oficina,
      cnpj = EXCLUDED.cnpj,
      telefone = EXCLUDED.telefone,
      email = EXCLUDED.email,
      responsavel = EXCLUDED.responsavel,
      is_active = EXCLUDED.is_active,
      ativo = EXCLUDED.ativo,
      trial_ends_at = EXCLUDED.trial_ends_at,
      plano = EXCLUDED.plano,
      logo_url = EXCLUDED.logo_url,
      endereco = EXCLUDED.endereco,
      cidade = EXCLUDED.cidade,
      estado = EXCLUDED.estado,
      cep = EXCLUDED.cep;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para sincronização automática
DROP TRIGGER IF EXISTS sync_profile_to_oficina_trigger ON public.profiles;
CREATE TRIGGER sync_profile_to_oficina_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_oficina();

-- Função para obter oficina_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_oficina_id()
RETURNS UUID AS $$
DECLARE
  oficina_id UUID;
BEGIN
  SELECT id INTO oficina_id 
  FROM public.oficinas 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN oficina_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;