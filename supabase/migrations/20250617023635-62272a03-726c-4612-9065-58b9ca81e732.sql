
-- Fix search_path security vulnerabilities for all database functions
-- This prevents potential SQL injection and schema confusion attacks

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

-- Fix create_oficina_from_profile function
CREATE OR REPLACE FUNCTION public.create_oficina_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role = 'oficina' THEN
    INSERT INTO public.oficinas (
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
$$;

-- Fix start_free_trial function
CREATE OR REPLACE FUNCTION public.start_free_trial(selected_plan_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID;
  existing_trial RECORD;
  trial_plan_type TEXT;
  result jsonb;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;
  
  SELECT * INTO existing_trial 
  FROM public.user_subscriptions 
  WHERE user_id = current_user_id 
  AND (status = 'trialing' OR status = 'active')
  LIMIT 1;
  
  IF existing_trial.id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário já possui trial ou assinatura ativa');
  END IF;
  
  IF selected_plan_type = 'essencial' THEN
    trial_plan_type := 'free_trial_essencial';
  ELSIF selected_plan_type = 'premium' THEN
    trial_plan_type := 'free_trial_premium';
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Tipo de plano inválido');
  END IF;
  
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    status,
    starts_at,
    trial_ends_at
  ) VALUES (
    current_user_id,
    trial_plan_type,
    'trialing',
    now(),
    now() + INTERVAL '7 days'
  );
  
  result := jsonb_build_object(
    'success', true,
    'plan_type', trial_plan_type,
    'trial_ends_at', now() + INTERVAL '7 days'
  );
  
  RETURN result;
END;
$$;

-- Fix update_subscription_after_payment function
CREATE OR REPLACE FUNCTION public.update_subscription_after_payment(p_user_id uuid, p_plan_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  subscription_ends_at TIMESTAMP WITH TIME ZONE;
  result jsonb;
BEGIN
  IF p_plan_type LIKE '%_anual' THEN
    subscription_ends_at := now() + INTERVAL '1 year';
  ELSE
    subscription_ends_at := now() + INTERVAL '1 month';
  END IF;
  
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    status,
    starts_at,
    ends_at
  ) VALUES (
    p_user_id,
    p_plan_type,
    'active',
    now(),
    subscription_ends_at
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = 'active',
    ends_at = EXCLUDED.ends_at,
    updated_at = now();
  
  result := jsonb_build_object(
    'success', true,
    'plan_type', p_plan_type,
    'ends_at', subscription_ends_at
  );
  
  RETURN result;
END;
$$;

-- Fix get_user_subscription function
CREATE OR REPLACE FUNCTION public.get_user_subscription()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID;
  subscription RECORD;
  result jsonb;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;
  
  SELECT * INTO subscription
  FROM public.user_subscriptions
  WHERE user_id = current_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF subscription.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'has_subscription', false
    );
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'has_subscription', true,
    'subscription', row_to_json(subscription)
  );
  
  RETURN result;
END;
$$;

-- Fix process_nfce_xml function
CREATE OR REPLACE FUNCTION public.process_nfce_xml(p_user_id uuid, p_produtos jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  produto JSONB;
  existing_product RECORD;
  new_product_id UUID;
  result JSONB := '{"produtos_processados": [], "novos_produtos": [], "produtos_atualizados": []}'::JSONB;
  produto_info JSONB;
BEGIN
  FOR produto IN SELECT * FROM jsonb_array_elements(p_produtos)
  LOOP
    SELECT * INTO existing_product 
    FROM public.services 
    WHERE user_id = p_user_id 
    AND codigo = produto->>'codigo'
    AND tipo = 'produto'
    LIMIT 1;
    
    IF existing_product.id IS NOT NULL THEN
      UPDATE public.services 
      SET quantidade_estoque = quantidade_estoque + (produto->>'quantidade')::INTEGER,
          updated_at = now()
      WHERE id = existing_product.id;
      
      produto_info := jsonb_build_object(
        'nome', existing_product.nome,
        'codigo', produto->>'codigo',
        'quantidade', produto->>'quantidade',
        'status', 'atualizado'
      );
      result := jsonb_set(result, '{produtos_atualizados}', 
        (result->'produtos_atualizados') || produto_info);
      
    ELSE
      INSERT INTO public.services (
        user_id, 
        nome, 
        codigo, 
        tipo, 
        valor, 
        quantidade_estoque,
        preco_custo,
        is_active
      ) VALUES (
        p_user_id,
        produto->>'nome',
        produto->>'codigo',
        'produto',
        (produto->>'preco_unitario')::NUMERIC,
        (produto->>'quantidade')::INTEGER,
        (produto->>'preco_unitario')::NUMERIC,
        true
      ) RETURNING id INTO new_product_id;
      
      produto_info := jsonb_build_object(
        'nome', produto->>'nome',
        'codigo', produto->>'codigo',
        'quantidade', produto->>'quantidade',
        'status', 'novo'
      );
      result := jsonb_set(result, '{novos_produtos}', 
        (result->'novos_produtos') || produto_info);
    END IF;
    
    result := jsonb_set(result, '{produtos_processados}', 
      (result->'produtos_processados') || produto_info);
  END LOOP;
  
  RETURN result;
END;
$$;

-- Fix remaining functions with search_path
CREATE OR REPLACE FUNCTION public.is_trial_active(user_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.update_user_plan(user_profile_id uuid, new_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.update_agendamentos_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_campanhas_marketing_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_fornecedores_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_notas_fiscais_updated_at()
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

-- Remove the insecure check_admin_permission function since we've replaced it with secure alternatives
DROP FUNCTION IF EXISTS public.check_admin_permission(text, text);
