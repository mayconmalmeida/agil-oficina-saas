
-- Adicionar coluna oficina_id na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS oficina_id UUID;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_profiles_oficina_id ON public.profiles(oficina_id);

-- Adicionar referência de chave estrangeira (opcional, para garantir integridade)
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_oficina_id 
FOREIGN KEY (oficina_id) REFERENCES public.oficinas(id) ON DELETE SET NULL;
