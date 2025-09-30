-- Corrigir a função validate_admin_login para usar bcrypt corretamente
CREATE OR REPLACE FUNCTION public.validate_admin_login(p_email text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  admin_record RECORD;
  password_valid BOOLEAN := FALSE;
BEGIN
  -- Buscar admin por email
  SELECT * INTO admin_record
  FROM public.admins
  WHERE email = p_email AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin não encontrado');
  END IF;
  
  -- Validar senha usando bcrypt (crypt function)
  -- Comparar o hash armazenado com a senha fornecida
  IF admin_record.password_hash = crypt(p_password, admin_record.password_hash) THEN
    password_valid := TRUE;
  END IF;
  
  IF NOT password_valid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Senha inválida');
  END IF;
  
  -- Atualizar último login
  UPDATE public.admins 
  SET last_login_at = now(), updated_at = now()
  WHERE id = admin_record.id;
  
  -- Retornar sucesso com dados do admin
  RETURN jsonb_build_object(
    'success', true,
    'admin', jsonb_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'role', admin_record.role,
      'is_active', admin_record.is_active
    )
  );
END;
$function$;

-- Inserir ou atualizar o usuário administrador
DO $$
DECLARE
  admin_exists BOOLEAN;
  new_password_hash TEXT;
BEGIN
  -- Gerar hash bcrypt para a senha "admin123"
  new_password_hash := crypt('admin123', gen_salt('bf', 12));
  
  -- Verificar se o admin já existe
  SELECT EXISTS(SELECT 1 FROM public.admins WHERE email = 'mayconintermediacao@gmail.com') INTO admin_exists;
  
  IF admin_exists THEN
    -- Atualizar admin existente
    UPDATE public.admins 
    SET 
      password_hash = new_password_hash,
      role = 'superadmin',
      is_active = true,
      updated_at = now()
    WHERE email = 'mayconintermediacao@gmail.com';
    
    RAISE NOTICE 'Admin atualizado: mayconintermediacao@gmail.com';
  ELSE
    -- Inserir novo admin
    INSERT INTO public.admins (email, password_hash, role, is_active, created_at, updated_at)
    VALUES (
      'mayconintermediacao@gmail.com',
      new_password_hash,
      'superadmin',
      true,
      now(),
      now()
    );
    
    RAISE NOTICE 'Admin criado: mayconintermediacao@gmail.com';
  END IF;
END $$;