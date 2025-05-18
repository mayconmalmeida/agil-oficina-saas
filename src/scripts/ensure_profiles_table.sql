
-- Function to create the profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION create_profile_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if table already exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Create the table
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
      plano TEXT DEFAULT 'basic',
      cnpj TEXT,
      responsavel TEXT,
      whatsapp_suporte TEXT DEFAULT '46991270777',
      logo_url TEXT,
      notify_new_client BOOLEAN DEFAULT TRUE,
      notify_approved_budget BOOLEAN DEFAULT TRUE,
      notify_by_email BOOLEAN DEFAULT FALSE,
      sound_enabled BOOLEAN DEFAULT FALSE
    );

    -- Apply RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow users to see and edit their own profiles
    CREATE POLICY "Users can see and edit their own profiles"
      ON public.profiles
      FOR ALL
      USING (auth.uid() = id);
      
    -- Add comments
    COMMENT ON TABLE public.profiles IS 'User profiles for the system';
  ELSE
    -- Table exists, check if it has all necessary columns
    -- Workshop name
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nome_oficina') THEN
      ALTER TABLE public.profiles ADD COLUMN nome_oficina TEXT;
    END IF;
    
    -- Phone
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'telefone') THEN
      ALTER TABLE public.profiles ADD COLUMN telefone TEXT;
    END IF;
    
    -- Full name
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
      ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
    
    -- Address
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'endereco') THEN
      ALTER TABLE public.profiles ADD COLUMN endereco TEXT;
    END IF;
    
    -- City
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cidade') THEN
      ALTER TABLE public.profiles ADD COLUMN cidade TEXT;
    END IF;
    
    -- State
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'estado') THEN
      ALTER TABLE public.profiles ADD COLUMN estado TEXT;
    END IF;
    
    -- Postal code
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cep') THEN
      ALTER TABLE public.profiles ADD COLUMN cep TEXT;
    END IF;
    
    -- Plan
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'plano') THEN
      ALTER TABLE public.profiles ADD COLUMN plano TEXT DEFAULT 'basic';
    END IF;
    
    -- CNPJ
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cnpj') THEN
      ALTER TABLE public.profiles ADD COLUMN cnpj TEXT;
    END IF;
    
    -- Responsible person
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'responsavel') THEN
      ALTER TABLE public.profiles ADD COLUMN responsavel TEXT;
    END IF;
    
    -- Support WhatsApp
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'whatsapp_suporte') THEN
      ALTER TABLE public.profiles ADD COLUMN whatsapp_suporte TEXT DEFAULT '46991270777';
    END IF;
    
    -- Logo URL
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'logo_url') THEN
      ALTER TABLE public.profiles ADD COLUMN logo_url TEXT;
    END IF;
    
    -- Notification preferences
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'notify_new_client') THEN
      ALTER TABLE public.profiles ADD COLUMN notify_new_client BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'notify_approved_budget') THEN
      ALTER TABLE public.profiles ADD COLUMN notify_approved_budget BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'notify_by_email') THEN
      ALTER TABLE public.profiles ADD COLUMN notify_by_email BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'sound_enabled') THEN
      ALTER TABLE public.profiles ADD COLUMN sound_enabled BOOLEAN DEFAULT FALSE;
    END IF;
  END IF;
END;
$$;

-- Function to ensure the profiles table exists with all necessary columns
CREATE OR REPLACE FUNCTION ensure_profiles_table()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Call the function to create/verify the table
  PERFORM create_profile_table();
  
  -- Return a success result
  result := jsonb_build_object(
    'success', true,
    'message', 'Profiles table verified and updated successfully'
  );
  
  RETURN result;
END;
$$;
