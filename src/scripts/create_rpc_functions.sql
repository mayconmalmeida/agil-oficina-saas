
-- Função para criar um perfil de usuário contornando RLS
CREATE OR REPLACE FUNCTION create_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (user_id, user_email, user_full_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar uma assinatura contornando RLS
CREATE OR REPLACE FUNCTION create_subscription(
  user_id UUID,
  plan_type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan, status, started_at, ends_at)
  VALUES (user_id, plan_type, 'trial', start_date, end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
