
-- Functions related to budgets

-- Function to create a budget
CREATE OR REPLACE FUNCTION create_budget(
  p_user_id UUID,
  p_cliente TEXT,
  p_veiculo TEXT,
  p_descricao TEXT,
  p_valor_total DECIMAL
) RETURNS VOID AS $$
BEGIN
  -- Create the budgets table if it doesn't exist
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
    
    -- Add RLS policies if they don't exist yet
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
  
  -- Insert the budget
  INSERT INTO budgets (user_id, cliente, veiculo, descricao, valor_total)
  VALUES (p_user_id, p_cliente, p_veiculo, p_descricao, p_valor_total);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
