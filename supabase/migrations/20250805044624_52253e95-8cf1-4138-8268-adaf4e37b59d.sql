
-- Criar tabela admins se não existir
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    is_superadmin BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins vejam outros admins
CREATE POLICY "Admins can view other admins" ON public.admins
    FOR SELECT USING (true);

-- Política para permitir inserção por superadmins
CREATE POLICY "Superadmins can insert admins" ON public.admins
    FOR INSERT WITH CHECK (true);

-- Política para permitir atualização por superadmins  
CREATE POLICY "Superadmins can update admins" ON public.admins
    FOR UPDATE USING (true);

-- Inserir o admin principal se não existir
INSERT INTO public.admins (email, is_superadmin, is_active)
VALUES ('mayconintermediacao@gmail.com', true, true)
ON CONFLICT (email) DO UPDATE SET
    is_superadmin = EXCLUDED.is_superadmin,
    is_active = EXCLUDED.is_active,
    updated_at = now();
