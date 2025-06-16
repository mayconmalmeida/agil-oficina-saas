
-- Atualizar a coluna plano na tabela profiles para usar os valores corretos
ALTER TABLE public.profiles 
ALTER COLUMN plano SET DEFAULT 'Essencial';

-- Adicionar coluna para controlar o trial de 7 dias
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Atualizar registros existentes que não têm trial_started_at definido
UPDATE public.profiles 
SET trial_started_at = created_at 
WHERE trial_started_at IS NULL;

-- Criar função para verificar se o trial ainda está ativo
CREATE OR REPLACE FUNCTION public.is_trial_active(user_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  trial_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT trial_started_at, plano INTO profile_record
  FROM public.profiles
  WHERE id = user_profile_id;
  
  IF profile_record.trial_started_at IS NULL THEN
    RETURN false;
  END IF;
  
  trial_end_date := profile_record.trial_started_at + INTERVAL '7 days';
  
  RETURN now() <= trial_end_date;
END;
$$;

-- Criar função para atualizar plano do usuário
CREATE OR REPLACE FUNCTION public.update_user_plan(user_profile_id uuid, new_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET plano = new_plan,
      trial_started_at = CASE 
        WHEN new_plan IN ('Essencial', 'Premium') AND trial_started_at IS NULL 
        THEN now() 
        ELSE trial_started_at 
      END
  WHERE id = user_profile_id;
END;
$$;
