
-- Criar tabela de estoque para produtos
CREATE TABLE IF NOT EXISTS public.estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  produto_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  codigo_produto TEXT,
  quantidade INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar RLS para estoque
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para estoque
CREATE POLICY "Users can view their own estoque" 
  ON public.estoque FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own estoque" 
  ON public.estoque FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estoque" 
  ON public.estoque FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estoque" 
  ON public.estoque FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar campos de estoque na tabela services se não existirem
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS codigo TEXT,
ADD COLUMN IF NOT EXISTS quantidade_estoque INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS preco_custo NUMERIC DEFAULT 0;

-- Função para processar XML da NFC-e
CREATE OR REPLACE FUNCTION public.process_nfce_xml(
  p_user_id UUID,
  p_produtos JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  produto JSONB;
  existing_product RECORD;
  new_product_id UUID;
  result JSONB := '{"produtos_processados": [], "novos_produtos": [], "produtos_atualizados": []}'::JSONB;
  produto_info JSONB;
BEGIN
  -- Iterar sobre os produtos do XML
  FOR produto IN SELECT * FROM jsonb_array_elements(p_produtos)
  LOOP
    -- Verificar se o produto já existe pelo código
    SELECT * INTO existing_product 
    FROM public.services 
    WHERE user_id = p_user_id 
    AND codigo = produto->>'codigo'
    AND tipo = 'produto'
    LIMIT 1;
    
    IF existing_product.id IS NOT NULL THEN
      -- Produto existe, atualizar estoque
      UPDATE public.services 
      SET quantidade_estoque = quantidade_estoque + (produto->>'quantidade')::INTEGER,
          updated_at = now()
      WHERE id = existing_product.id;
      
      -- Adicionar ao resultado como atualizado
      produto_info := jsonb_build_object(
        'nome', existing_product.nome,
        'codigo', produto->>'codigo',
        'quantidade', produto->>'quantidade',
        'status', 'atualizado'
      );
      result := jsonb_set(result, '{produtos_atualizados}', 
        (result->'produtos_atualizados') || produto_info);
      
    ELSE
      -- Produto não existe, criar novo
      INSERT INTO public.services (
        user_id, 
        nome, 
        codigo, 
        tipo, 
        valor, 
        quantidade_estoque,
        preco_custo,
        is_active
      ) VALUES (
        p_user_id,
        produto->>'nome',
        produto->>'codigo',
        'produto',
        (produto->>'preco_unitario')::NUMERIC,
        (produto->>'quantidade')::INTEGER,
        (produto->>'preco_unitario')::NUMERIC,
        true
      ) RETURNING id INTO new_product_id;
      
      -- Adicionar ao resultado como novo
      produto_info := jsonb_build_object(
        'nome', produto->>'nome',
        'codigo', produto->>'codigo',
        'quantidade', produto->>'quantidade',
        'status', 'novo'
      );
      result := jsonb_set(result, '{novos_produtos}', 
        (result->'novos_produtos') || produto_info);
    END IF;
    
    -- Adicionar ao array geral de processados
    result := jsonb_set(result, '{produtos_processados}', 
      (result->'produtos_processados') || produto_info);
  END LOOP;
  
  RETURN result;
END;
$$;
