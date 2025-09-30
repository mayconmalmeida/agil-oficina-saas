-- Create global_configurations table
CREATE TABLE IF NOT EXISTS global_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('checkout', 'whatsapp', 'messages', 'system')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_global_configurations_key ON global_configurations(key);
CREATE INDEX IF NOT EXISTS idx_global_configurations_category ON global_configurations(category);
CREATE INDEX IF NOT EXISTS idx_global_configurations_active ON global_configurations(is_active);

-- Insert default configurations
INSERT INTO global_configurations (key, value, description, category, is_active) VALUES
  ('checkout_link_mensal', 'https://checkout.cackto.com.br/premium/mensal', 'Link de checkout para plano mensal', 'checkout', true),
  ('checkout_link_anual', 'https://checkout.cackto.com.br/premium/anual', 'Link de checkout para plano anual', 'checkout', true),
  ('whatsapp_support', '+5546999324779', 'Número do WhatsApp de suporte', 'whatsapp', true),
  ('welcome_message', 'Bem-vindo ao OficinaGo! Estamos aqui para ajudar você a gerenciar sua oficina de forma eficiente.', 'Mensagem de boas-vindas automática', 'messages', true)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE global_configurations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for global_configurations" ON global_configurations;
DROP POLICY IF EXISTS "Service role full access for global_configurations" ON global_configurations;
DROP POLICY IF EXISTS "Admin users can modify global_configurations" ON global_configurations;

-- Create RLS policies
-- Public read access (anyone can read configurations)
CREATE POLICY "Public read access for global_configurations"
ON global_configurations FOR SELECT
TO public
USING (true);

-- Service role has full access
CREATE POLICY "Service role full access for global_configurations"
ON global_configurations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admin users can modify configurations
CREATE POLICY "Admin users can modify global_configurations"
ON global_configurations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Grant permissions
GRANT SELECT ON global_configurations TO public;
GRANT ALL ON global_configurations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON global_configurations TO authenticated;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_global_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_global_configurations_updated_at
  BEFORE UPDATE ON global_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_global_configurations_updated_at();