
-- Criar tabela ordens_servico
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  oficina_id UUID,
  cliente_id UUID NOT NULL,
  veiculo_id UUID,
  orcamento_id UUID,
  status TEXT DEFAULT 'Aberta',
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fim TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  valor_total NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ordens_servico
CREATE POLICY "Users can view their own ordens_servico"
  ON public.ordens_servico FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ordens_servico"
  ON public.ordens_servico FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ordens_servico"
  ON public.ordens_servico FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ordens_servico"
  ON public.ordens_servico FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ordens_servico_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_ordens_servico_updated_at
  BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION update_ordens_servico_updated_at();

-- Tabela para itens das ordens de serviço
CREATE TABLE IF NOT EXISTS public.ordem_servico_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES public.services(id),
  nome_item TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('produto', 'servico')),
  quantidade INTEGER DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para ordem_servico_itens
ALTER TABLE public.ordem_servico_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage items of their own ordens_servico"
  ON public.ordem_servico_itens FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.ordens_servico 
    WHERE id = ordem_servico_itens.ordem_servico_id 
    AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ordens_servico 
    WHERE id = ordem_servico_itens.ordem_servico_id 
    AND user_id = auth.uid()
  ));

-- Função para criar ordem de serviço a partir de orçamento
CREATE OR REPLACE FUNCTION create_ordem_servico_from_orcamento(
  p_user_id UUID,
  p_orcamento_id UUID,
  p_observacoes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  orcamento_data RECORD;
  nova_ordem_id UUID;
BEGIN
  -- Buscar dados do orçamento
  SELECT * INTO orcamento_data 
  FROM public.orcamentos 
  WHERE id = p_orcamento_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orçamento não encontrado';
  END IF;
  
  -- Criar ordem de serviço
  INSERT INTO public.ordens_servico (
    user_id,
    cliente_id,
    orcamento_id,
    status,
    observacoes,
    valor_total
  ) VALUES (
    p_user_id,
    (SELECT id FROM public.clients WHERE nome = orcamento_data.cliente AND user_id = p_user_id LIMIT 1),
    p_orcamento_id,
    'Aberta',
    p_observacoes,
    orcamento_data.valor_total
  ) RETURNING id INTO nova_ordem_id;
  
  -- Atualizar status do orçamento
  UPDATE public.orcamentos 
  SET status = 'aprovado' 
  WHERE id = p_orcamento_id;
  
  RETURN nova_ordem_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
