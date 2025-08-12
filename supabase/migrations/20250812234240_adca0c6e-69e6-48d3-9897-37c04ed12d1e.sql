
-- 1. Adicionar restrição única no email da tabela oficinas para evitar duplicação
ALTER TABLE oficinas ADD CONSTRAINT oficinas_email_unique UNIQUE (email);

-- 2. Criar função para buscar ou criar oficina no login
CREATE OR REPLACE FUNCTION get_or_create_oficina(
  p_user_id UUID,
  p_email TEXT,
  p_nome_oficina TEXT DEFAULT NULL,
  p_telefone TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  oficina_record RECORD;
  new_oficina_id UUID;
BEGIN
  -- Buscar oficina existente pelo email
  SELECT id, user_id INTO oficina_record
  FROM oficinas 
  WHERE email = p_email
  LIMIT 1;
  
  -- Se encontrou oficina existente
  IF oficina_record.id IS NOT NULL THEN
    -- Se a oficina não tem user_id ou é diferente, atualizar
    IF oficina_record.user_id IS NULL OR oficina_record.user_id != p_user_id THEN
      UPDATE oficinas 
      SET user_id = p_user_id,
          is_active = true,
          ativo = true
      WHERE id = oficina_record.id;
    END IF;
    
    RETURN oficina_record.id;
  ELSE
    -- Criar nova oficina
    INSERT INTO oficinas (
      user_id,
      email,
      nome_oficina,
      telefone,
      is_active,
      ativo
    ) VALUES (
      p_user_id,
      p_email,
      COALESCE(p_nome_oficina, 'Nova Oficina'),
      p_telefone,
      true,
      true
    ) RETURNING id INTO new_oficina_id;
    
    RETURN new_oficina_id;
  END IF;
END;
$$;

-- 3. Criar tabela para histórico de conversas da IA
CREATE TABLE IF NOT EXISTS public.ia_suporte_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID REFERENCES oficinas(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para conversas da IA
ALTER TABLE public.ia_suporte_conversas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Oficina pode ver suas conversas"
  ON public.ia_suporte_conversas FOR SELECT
  USING (oficina_id IN (
    SELECT id FROM oficinas WHERE user_id = auth.uid()
  ));

CREATE POLICY "Oficina pode criar suas conversas"
  ON public.ia_suporte_conversas FOR INSERT
  WITH CHECK (oficina_id IN (
    SELECT id FROM oficinas WHERE user_id = auth.uid()
  ));

-- 4. Atualizar senhas de admin para bcrypt (exemplo para admins existentes)
-- Nota: As senhas precisarão ser redefinidas pelos admins após esta alteração
UPDATE admins SET password = '$2a$10$placeholder' WHERE password NOT LIKE '$2a$%';

-- 5. Adicionar trigger para atualizar updated_at nas conversas
CREATE OR REPLACE FUNCTION update_ia_conversas_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ia_conversas_updated_at
  BEFORE UPDATE ON public.ia_suporte_conversas
  FOR EACH ROW EXECUTE FUNCTION update_ia_conversas_updated_at();
