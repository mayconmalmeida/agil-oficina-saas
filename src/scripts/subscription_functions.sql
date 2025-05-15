
-- Functions related to subscriptions

-- Function to create a subscription while bypassing RLS
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

-- Function to create or update onboarding status
CREATE OR REPLACE FUNCTION ensure_onboarding_status(
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO onboarding_status (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
