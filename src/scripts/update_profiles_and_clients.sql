
-- Update profiles table to include logo_url and documents columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT NULL;

-- Update clients table to add marca, modelo, ano, placa columns if they don't exist
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marca TEXT DEFAULT NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS modelo TEXT DEFAULT NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ano TEXT DEFAULT NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS placa TEXT DEFAULT NULL;

-- Drop and recreate the create_client function to include additional parameters
CREATE OR REPLACE FUNCTION public.create_client(
  p_user_id UUID,
  p_nome TEXT,
  p_telefone TEXT,
  p_email TEXT,
  p_veiculo TEXT,
  p_marca TEXT,
  p_modelo TEXT,
  p_ano TEXT,
  p_placa TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.clients (user_id, nome, telefone, email, veiculo, marca, modelo, ano, placa)
  VALUES (p_user_id, p_nome, p_telefone, p_email, p_veiculo, p_marca, p_modelo, p_ano, p_placa);
END;
$$;
