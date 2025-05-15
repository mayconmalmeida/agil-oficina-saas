
-- Functions related to services and products

-- Function to create a service or product
CREATE OR REPLACE FUNCTION create_service(
  p_user_id UUID,
  p_nome TEXT,
  p_tipo TEXT,
  p_valor DECIMAL,
  p_descricao TEXT
) RETURNS VOID AS $$
BEGIN
  -- Create the services table if it doesn't exist
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
    
    -- Add RLS policies if they don't exist yet
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
  
  -- Insert the service/product
  INSERT INTO services (user_id, nome, tipo, valor, descricao)
  VALUES (p_user_id, p_nome, p_tipo, p_valor, p_descricao);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
