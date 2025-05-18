
-- Functions related to clients

-- Function to create a client
CREATE OR REPLACE FUNCTION create_client(
  p_user_id UUID,
  p_nome TEXT,
  p_telefone TEXT,
  p_email TEXT,
  p_veiculo TEXT,
  p_marca TEXT,
  p_modelo TEXT,
  p_ano TEXT,
  p_placa TEXT,
  p_endereco TEXT DEFAULT NULL,
  p_cidade TEXT DEFAULT NULL,
  p_estado TEXT DEFAULT NULL,
  p_cep TEXT DEFAULT NULL,
  p_documento TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Create the clients table if it doesn't exist
  EXECUTE '
    CREATE TABLE IF NOT EXISTS clients (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT,
      veiculo TEXT NOT NULL,
      marca TEXT,
      modelo TEXT,
      ano TEXT,
      placa TEXT,
      endereco TEXT,
      cidade TEXT,
      estado TEXT,
      cep TEXT,
      documento TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc'', now())
    );
    
    -- Add RLS policies if they don''t exist yet
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
  
  -- Add columns if they don't exist
  BEGIN
    EXECUTE '
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS marca TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS modelo TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS ano TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS placa TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS endereco TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS cidade TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS estado TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS cep TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS documento TEXT;
    ';
  EXCEPTION WHEN OTHERS THEN
    -- Handle errors
    RAISE NOTICE 'Error updating clients table: %', SQLERRM;
  END;
  
  -- Insert the client
  INSERT INTO clients (user_id, nome, telefone, email, veiculo, marca, modelo, ano, placa, endereco, cidade, estado, cep, documento)
  VALUES (p_user_id, p_nome, p_telefone, p_email, p_veiculo, p_marca, p_modelo, p_ano, p_placa, p_endereco, p_cidade, p_estado, p_cep, p_documento);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

