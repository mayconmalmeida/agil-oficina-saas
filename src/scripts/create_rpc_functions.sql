
-- Função para criar um perfil de usuário contornando RLS
CREATE OR REPLACE FUNCTION create_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (user_id, user_email, user_full_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create the profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION create_profile_table() RETURNS VOID AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id),
      email TEXT,
      full_name TEXT,
      nome_oficina TEXT,
      telefone TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS policies
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for users to select their own profile
    CREATE POLICY select_own_profile ON profiles FOR SELECT
      USING (auth.uid() = id);
    
    -- Create policy for users to update their own profile
    CREATE POLICY update_own_profile ON profiles FOR UPDATE
      USING (auth.uid() = id);
    
    -- Create policy for users to insert their own profile
    CREATE POLICY insert_own_profile ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  ELSE
    -- Add columns if they don't exist
    BEGIN
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nome_oficina TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone TEXT;
    EXCEPTION WHEN OTHERS THEN
      -- Handle errors
      RAISE NOTICE 'Error updating profiles table: %', SQLERRM;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar uma assinatura contornando RLS
CREATE OR REPLACE FUNCTION create_subscription(
  user_id UUID,
  plan_type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan, status, started_at, ends_at)
  VALUES (user_id, plan_type, 'trial', start_date, end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar ou atualizar o status de onboarding
CREATE OR REPLACE FUNCTION ensure_onboarding_status(
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO onboarding_status (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar um cliente
CREATE OR REPLACE FUNCTION create_client(
  p_user_id UUID,
  p_nome TEXT,
  p_telefone TEXT,
  p_email TEXT,
  p_veiculo TEXT
) RETURNS VOID AS $$
BEGIN
  -- Cria a tabela clientes se não existir
  EXECUTE '
    CREATE TABLE IF NOT EXISTS clients (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT,
      veiculo TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc'', now())
    );
    
    -- Adiciona política de RLS se ainda não existir
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = ''clients'' AND policyname = ''Clients are viewable by their owners''
      ) THEN
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Clients are viewable by their owners" 
        ON clients FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Clients are editable by their owners" 
        ON clients FOR INSERT, UPDATE
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Clients are deletable by their owners" 
        ON clients FOR DELETE
        USING (auth.uid() = user_id);
      END IF;
    END $$;
  ';
  
  -- Insere o cliente
  INSERT INTO clients (user_id, nome, telefone, email, veiculo)
  VALUES (p_user_id, p_nome, p_telefone, p_email, p_veiculo);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar um serviço ou produto
CREATE OR REPLACE FUNCTION create_service(
  p_user_id UUID,
  p_nome TEXT,
  p_tipo TEXT,
  p_valor DECIMAL,
  p_descricao TEXT
) RETURNS VOID AS $$
BEGIN
  -- Cria a tabela services se não existir
  EXECUTE '
    CREATE TABLE IF NOT EXISTS services (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      valor DECIMAL(10,2) NOT NULL,
      descricao TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc'', now())
    );
    
    -- Adiciona política de RLS se ainda não existir
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = ''services'' AND policyname = ''Services are viewable by their owners''
      ) THEN
        ALTER TABLE services ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Services are viewable by their owners" 
        ON services FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Services are editable by their owners" 
        ON services FOR INSERT, UPDATE
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Services are deletable by their owners" 
        ON services FOR DELETE
        USING (auth.uid() = user_id);
      END IF;
    END $$;
  ';
  
  -- Insere o serviço/produto
  INSERT INTO services (user_id, nome, tipo, valor, descricao)
  VALUES (p_user_id, p_nome, p_tipo, p_valor, p_descricao);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar um orçamento
CREATE OR REPLACE FUNCTION create_budget(
  p_user_id UUID,
  p_cliente TEXT,
  p_veiculo TEXT,
  p_descricao TEXT,
  p_valor_total DECIMAL
) RETURNS VOID AS $$
BEGIN
  -- Cria a tabela budgets se não existir
  EXECUTE '
    CREATE TABLE IF NOT EXISTS budgets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      cliente TEXT NOT NULL,
      veiculo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      valor_total DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT ''pendente'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc'', now())
    );
    
    -- Adiciona política de RLS se ainda não existir
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = ''budgets'' AND policyname = ''Budgets are viewable by their owners''
      ) THEN
        ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Budgets are viewable by their owners" 
        ON budgets FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Budgets are editable by their owners" 
        ON budgets FOR INSERT, UPDATE
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Budgets are deletable by their owners" 
        ON budgets FOR DELETE
        USING (auth.uid() = user_id);
      END IF;
    END $$;
  ';
  
  -- Insere o orçamento
  INSERT INTO budgets (user_id, cliente, veiculo, descricao, valor_total)
  VALUES (p_user_id, p_cliente, p_veiculo, p_descricao, p_valor_total);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
