
-- Atualizar a tabela admins para usar hash bcrypt seguro
-- Primeiro, vamos renomear a coluna password para password_hash para ser mais claro
ALTER TABLE public.admins RENAME COLUMN password TO password_hash;

-- Adicionar comentário para documentar que deve ser hash bcrypt
COMMENT ON COLUMN public.admins.password_hash IS 'Hash bcrypt da senha do administrador';

-- Criar função para validar formato de hash bcrypt
CREATE OR REPLACE FUNCTION public.is_valid_bcrypt_hash(hash_text text)
RETURNS boolean AS $$
BEGIN
  -- Verificar se o hash tem o formato bcrypt ($2a$, $2b$, $2x$, $2y$ seguido de custo e hash)
  RETURN hash_text ~ '^\$2[abxy]\$[0-9]{2}\$.{53}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Adicionar constraint para garantir que apenas hashes bcrypt válidos sejam armazenados
ALTER TABLE public.admins 
ADD CONSTRAINT valid_bcrypt_hash 
CHECK (public.is_valid_bcrypt_hash(password_hash));
