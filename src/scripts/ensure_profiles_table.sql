
-- Função para criar a tabela profiles se ela não existir
CREATE OR REPLACE FUNCTION create_profile_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se a tabela já existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Cria a tabela
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      nome_oficina TEXT,
      telefone TEXT,
      full_name TEXT,
      endereco TEXT,
      cidade TEXT,
      estado TEXT,
      cep TEXT,
      plano TEXT DEFAULT 'basic'
    );

    -- Aplica RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Cria uma política para permitir que usuários vejam e editem seu próprio perfil
    CREATE POLICY "Usuários podem ver seu próprio perfil"
      ON public.profiles
      FOR ALL
      USING (auth.uid() = id);
      
    -- Adiciona comentários
    COMMENT ON TABLE public.profiles IS 'Perfis dos usuários do sistema';
  ELSE
    -- A tabela existe, verificar se tem todas as colunas necessárias
    -- Nome da oficina
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nome_oficina') THEN
      ALTER TABLE public.profiles ADD COLUMN nome_oficina TEXT;
    END IF;
    
    -- Telefone
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'telefone') THEN
      ALTER TABLE public.profiles ADD COLUMN telefone TEXT;
    END IF;
    
    -- Full name
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
      ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
    
    -- Endereço
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'endereco') THEN
      ALTER TABLE public.profiles ADD COLUMN endereco TEXT;
    END IF;
    
    -- Cidade
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cidade') THEN
      ALTER TABLE public.profiles ADD COLUMN cidade TEXT;
    END IF;
    
    -- Estado
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'estado') THEN
      ALTER TABLE public.profiles ADD COLUMN estado TEXT;
    END IF;
    
    -- CEP
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cep') THEN
      ALTER TABLE public.profiles ADD COLUMN cep TEXT;
    END IF;
    
    -- Plano
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'plano') THEN
      ALTER TABLE public.profiles ADD COLUMN plano TEXT DEFAULT 'basic';
    END IF;
  END IF;
END;
$$;

-- Função para garantir que a tabela profiles existe com todas as colunas necessárias
CREATE OR REPLACE FUNCTION ensure_profiles_table()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Chama a função para criar/verificar a tabela
  PERFORM create_profile_table();
  
  -- Retorna um resultado de sucesso
  result := jsonb_build_object(
    'success', true,
    'message', 'Tabela de perfis verificada e atualizada com sucesso'
  );
  
  RETURN result;
END;
$$;
