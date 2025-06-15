
-- 1. Adiciona colunas essenciais caso não existam
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS nome_oficina TEXT;
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 2. Copia apenas perfis de oficina para a tabela oficinas, evitando duplicidade
INSERT INTO oficinas (
  id,
  user_id,
  nome_oficina,
  cnpj,
  telefone,
  email,
  created_at,
  is_active,
  ativo
)
SELECT
  p.id,
  p.id AS user_id,
  p.nome_oficina,
  p.cnpj,
  p.telefone,
  p.email,
  p.created_at,
  COALESCE(p.is_active, true),
  COALESCE(p.is_active, true)
FROM profiles p
LEFT JOIN oficinas o ON o.id = p.id
WHERE o.id IS NULL
  AND (p.role = 'oficina' OR p.role IS NULL);
