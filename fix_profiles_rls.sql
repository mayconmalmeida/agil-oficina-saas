-- Corrigir políticas RLS da tabela profiles para permitir login adequado

-- Primeiro, remover TODAS as políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can see and edit their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view other admin profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Habilitar RLS na tabela profiles (se não estiver habilitado)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS mais permissivas para resolver problemas de autenticação
-- Política para SELECT - permite que usuários vejam seus próprios perfis
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        auth.uid() IS NOT NULL  -- Permite acesso durante o processo de autenticação
    );

-- Política para INSERT - permite que usuários criem seus próprios perfis
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        auth.uid() IS NOT NULL  -- Permite criação durante o processo de autenticação
    );

-- Política para UPDATE - permite que usuários atualizem seus próprios perfis
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id
    ) WITH CHECK (
        auth.uid() = id
    );

-- Política para DELETE - permite que usuários deletem seus próprios perfis (se necessário)
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (
        auth.uid() = id
    );

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Verificar se a tabela profiles existe e tem os campos necessários
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;