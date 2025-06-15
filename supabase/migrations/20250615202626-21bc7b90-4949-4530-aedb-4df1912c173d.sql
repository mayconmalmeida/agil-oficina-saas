
-- Função que insere automaticamente na tabela oficinas ao criar novo profile de oficina
CREATE OR REPLACE FUNCTION create_oficina_from_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Garante que só cria a oficina no caso do perfil ser do tipo 'oficina'
  IF NEW.role = 'oficina' THEN
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
    ) VALUES (
      NEW.id,
      NEW.id,
      NEW.nome_oficina,
      NEW.cnpj,
      NEW.telefone,
      NEW.email,
      NEW.created_at,
      COALESCE(NEW.is_active, true),
      COALESCE(NEW.is_active, true)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove a trigger antiga caso exista, para evitar duplicidade/confusão
DROP TRIGGER IF EXISTS trg_create_oficina_from_profile ON profiles;

-- Cria a nova trigger para hookup automático
CREATE TRIGGER trg_create_oficina_from_profile
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_oficina_from_profile();
