-- Criar tabela para armazenar itens de orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_id UUID NOT NULL, -- ID do produto/serviço
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('produto', 'servico')),
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orcamento_itens
CREATE POLICY "Users can view their own orcamento_itens"
  ON public.orcamento_itens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orcamento_itens"
  ON public.orcamento_itens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orcamento_itens"
  ON public.orcamento_itens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orcamento_itens"
  ON public.orcamento_itens FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_orcamento_itens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_orcamento_itens_updated_at
  BEFORE UPDATE ON public.orcamento_itens
  FOR EACH ROW
  EXECUTE FUNCTION update_orcamento_itens_updated_at();