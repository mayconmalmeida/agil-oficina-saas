
-- Criar tabela para gestão de usuários/colaboradores
CREATE TABLE public.usuarios_colaboradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  oficina_id UUID REFERENCES public.oficinas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  funcao TEXT NOT NULL DEFAULT 'colaborador', -- administrador, recepcionista, mecanico, financeiro
  permissoes JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email, oficina_id)
);

-- Criar tabela para controle de entrada/saída de estoque
CREATE TABLE public.movimentacao_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  produto_id UUID REFERENCES public.services(id) NOT NULL,
  tipo_movimentacao TEXT NOT NULL, -- 'entrada', 'saida', 'ajuste'
  quantidade INTEGER NOT NULL,
  quantidade_anterior INTEGER NOT NULL,
  quantidade_atual INTEGER NOT NULL,
  motivo TEXT,
  ordem_servico_id UUID REFERENCES public.ordens_servico(id),
  nota_fiscal_id UUID REFERENCES public.notas_fiscais(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Adicionar campo de estoque mínimo na tabela services se não existir
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS estoque_minimo INTEGER DEFAULT 0;

-- Criar tabela para alertas de estoque
CREATE TABLE public.alertas_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  produto_id UUID REFERENCES public.services(id) NOT NULL,
  tipo_alerta TEXT NOT NULL DEFAULT 'estoque_baixo',
  visualizado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para cotações/pedidos para fornecedores
CREATE TABLE public.cotacoes_fornecedor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id) NOT NULL,
  produtos JSONB NOT NULL, -- Array de produtos solicitados
  status TEXT DEFAULT 'enviado', -- enviado, respondido, finalizado
  observacoes TEXT,
  ordem_servico_id UUID REFERENCES public.ordens_servico(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar RLS policies para usuarios_colaboradores
ALTER TABLE public.usuarios_colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view colaboradores of their oficina"
  ON public.usuarios_colaboradores FOR SELECT
  USING (oficina_id IN (SELECT id FROM oficinas WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert colaboradores in their oficina"
  ON public.usuarios_colaboradores FOR INSERT
  WITH CHECK (oficina_id IN (SELECT id FROM oficinas WHERE user_id = auth.uid()));

CREATE POLICY "Users can update colaboradores of their oficina"
  ON public.usuarios_colaboradores FOR UPDATE
  USING (oficina_id IN (SELECT id FROM oficinas WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete colaboradores of their oficina"
  ON public.usuarios_colaboradores FOR DELETE
  USING (oficina_id IN (SELECT id FROM oficinas WHERE user_id = auth.uid()));

-- Criar RLS policies para movimentacao_estoque
ALTER TABLE public.movimentacao_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own movimentacao_estoque"
  ON public.movimentacao_estoque FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movimentacao_estoque"
  ON public.movimentacao_estoque FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Criar RLS policies para alertas_estoque
ALTER TABLE public.alertas_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alertas_estoque"
  ON public.alertas_estoque FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alertas_estoque"
  ON public.alertas_estoque FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alertas_estoque"
  ON public.alertas_estoque FOR UPDATE
  USING (auth.uid() = user_id);

-- Criar RLS policies para cotacoes_fornecedor
ALTER TABLE public.cotacoes_fornecedor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cotacoes_fornecedor"
  ON public.cotacoes_fornecedor FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cotacoes_fornecedor"
  ON public.cotacoes_fornecedor FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cotacoes_fornecedor"
  ON public.cotacoes_fornecedor FOR UPDATE
  USING (auth.uid() = user_id);

-- Criar função para baixa automática de estoque
CREATE OR REPLACE FUNCTION public.baixar_estoque_ordem_servico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Quando um item é adicionado à ordem de serviço, baixar do estoque
  IF TG_OP = 'INSERT' AND NEW.tipo = 'produto' THEN
    -- Atualizar quantidade no estoque
    UPDATE public.services 
    SET quantidade_estoque = quantidade_estoque - NEW.quantidade
    WHERE id = NEW.servico_id AND quantidade_estoque >= NEW.quantidade;
    
    -- Registrar movimentação
    INSERT INTO public.movimentacao_estoque (
      user_id, produto_id, tipo_movimentacao, quantidade, 
      quantidade_anterior, quantidade_atual, motivo, ordem_servico_id
    )
    SELECT 
      (SELECT user_id FROM ordens_servico WHERE id = NEW.ordem_servico_id),
      NEW.servico_id,
      'saida',
      NEW.quantidade,
      s.quantidade_estoque + NEW.quantidade,
      s.quantidade_estoque,
      'Baixa automática - OS',
      NEW.ordem_servico_id
    FROM public.services s WHERE s.id = NEW.servico_id;
    
    -- Verificar se precisa criar alerta de estoque baixo
    INSERT INTO public.alertas_estoque (user_id, produto_id, tipo_alerta)
    SELECT 
      (SELECT user_id FROM ordens_servico WHERE id = NEW.ordem_servico_id),
      NEW.servico_id,
      'estoque_baixo'
    FROM public.services s 
    WHERE s.id = NEW.servico_id 
    AND s.quantidade_estoque <= s.estoque_minimo
    AND NOT EXISTS (
      SELECT 1 FROM alertas_estoque 
      WHERE produto_id = NEW.servico_id 
      AND tipo_alerta = 'estoque_baixo' 
      AND visualizado = false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para baixa automática
CREATE TRIGGER trigger_baixar_estoque_ordem_servico
  AFTER INSERT ON public.ordem_servico_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.baixar_estoque_ordem_servico();

-- Criar triggers para updated_at
CREATE TRIGGER update_usuarios_colaboradores_updated_at
  BEFORE UPDATE ON public.usuarios_colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cotacoes_fornecedor_updated_at
  BEFORE UPDATE ON public.cotacoes_fornecedor
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
