-- Script para adicionar políticas RLS à tabela orcamentos
-- Execute este script no SQL Editor do Supabase Dashboard

-- Habilitar RLS na tabela orcamentos se ainda não estiver habilitado
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver (para evitar conflitos)
DROP POLICY IF EXISTS "Users can view their own orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Users can insert their own orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Users can update their own orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Users can delete their own orcamentos" ON public.orcamentos;

-- Política para visualizar orçamentos próprios
CREATE POLICY "Users can view their own orcamentos"
  ON public.orcamentos FOR SELECT
  USING (auth.uid() = user_id);

-- Política para inserir orçamentos próprios
CREATE POLICY "Users can insert their own orcamentos"
  ON public.orcamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para atualizar orçamentos próprios
CREATE POLICY "Users can update their own orcamentos"
  ON public.orcamentos FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para deletar orçamentos próprios
CREATE POLICY "Users can delete their own orcamentos"
  ON public.orcamentos FOR DELETE
  USING (auth.uid() = user_id);

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'orcamentos';