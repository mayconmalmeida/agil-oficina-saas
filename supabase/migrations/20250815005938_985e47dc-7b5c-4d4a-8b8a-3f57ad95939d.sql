
-- Verificar se a coluna oficina_id existe na tabela fornecedores
-- Se não existir, vamos adicioná-la
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='fornecedores' AND column_name='oficina_id'
    ) THEN
        ALTER TABLE public.fornecedores ADD COLUMN oficina_id UUID;
    END IF;
END $$;

-- Criar função para auto-definir oficina_id se ainda não existir
CREATE OR REPLACE FUNCTION public.auto_set_fornecedor_oficina_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Se oficina_id não está definido, buscar automaticamente
  IF NEW.oficina_id IS NULL THEN
    SELECT id INTO NEW.oficina_id 
    FROM public.oficinas 
    WHERE user_id = NEW.user_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela fornecedores
DROP TRIGGER IF EXISTS trigger_auto_set_fornecedor_oficina_id ON public.fornecedores;
CREATE TRIGGER trigger_auto_set_fornecedor_oficina_id
  BEFORE INSERT ON public.fornecedores
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_fornecedor_oficina_id();

-- Atualizar registros existentes que não têm oficina_id
UPDATE public.fornecedores 
SET oficina_id = (
  SELECT o.id 
  FROM public.oficinas o 
  WHERE o.user_id = fornecedores.user_id 
  LIMIT 1
)
WHERE oficina_id IS NULL;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can create their own fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "Users can view their own fornecedores" ON public.fornecedores;  
DROP POLICY IF EXISTS "Users can update their own fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "Users can delete their own fornecedores" ON public.fornecedores;

-- Criar políticas RLS baseadas em oficina_id
CREATE POLICY "Oficina pode criar seus fornecedores"
  ON public.fornecedores
  FOR INSERT
  WITH CHECK (
    oficina_id IN (
      SELECT id FROM public.oficinas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Oficina pode ver seus fornecedores"
  ON public.fornecedores
  FOR SELECT
  USING (
    oficina_id IN (
      SELECT id FROM public.oficinas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Oficina pode atualizar seus fornecedores"
  ON public.fornecedores
  FOR UPDATE
  USING (
    oficina_id IN (
      SELECT id FROM public.oficinas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Oficina pode deletar seus fornecedores"
  ON public.fornecedores
  FOR DELETE
  USING (
    oficina_id IN (
      SELECT id FROM public.oficinas WHERE user_id = auth.uid()
    )
  );

-- Criar função auxiliar para obter oficina_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_oficina_id()
RETURNS UUID AS $$
DECLARE
  oficina_id UUID;
BEGIN
  SELECT id INTO oficina_id 
  FROM public.oficinas 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN oficina_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger para auto-definir oficina_id em outras tabelas que precisam
CREATE OR REPLACE FUNCTION public.auto_set_oficina_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Se oficina_id não está definido, buscar automaticamente
  IF NEW.oficina_id IS NULL THEN
    NEW.oficina_id := public.get_user_oficina_id();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
