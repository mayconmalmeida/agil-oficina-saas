
-- Criar tabela de fornecedores
CREATE TABLE public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  cnpj TEXT,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para fornecedores
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para fornecedores
CREATE POLICY "Users can view their own fornecedores"
  ON public.fornecedores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fornecedores"
  ON public.fornecedores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fornecedores"
  ON public.fornecedores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fornecedores"
  ON public.fornecedores FOR DELETE
  USING (auth.uid() = user_id);

-- Criar tabela de notas fiscais
CREATE TABLE public.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  numero TEXT NOT NULL,
  data_emissao TIMESTAMPTZ NOT NULL,
  valor_total NUMERIC NOT NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  cliente_id UUID REFERENCES public.clients(id),
  xml_url TEXT,
  status TEXT DEFAULT 'importado' CHECK (status IN ('importado', 'erro', 'aguardando', 'emitido')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para notas fiscais
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notas fiscais
CREATE POLICY "Users can view their own notas_fiscais"
  ON public.notas_fiscais FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notas_fiscais"
  ON public.notas_fiscais FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notas_fiscais"
  ON public.notas_fiscais FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notas_fiscais"
  ON public.notas_fiscais FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_fornecedores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fornecedores_updated_at
  BEFORE UPDATE ON public.fornecedores
  FOR EACH ROW EXECUTE PROCEDURE update_fornecedores_updated_at();

CREATE OR REPLACE FUNCTION update_notas_fiscais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notas_fiscais_updated_at
  BEFORE UPDATE ON public.notas_fiscais
  FOR EACH ROW EXECUTE PROCEDURE update_notas_fiscais_updated_at();
