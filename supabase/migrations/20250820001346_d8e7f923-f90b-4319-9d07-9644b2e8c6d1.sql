
-- Add theme_preference and notification_settings columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "email_agendamentos": true,
  "email_pagamentos": true,
  "email_clientes": false,
  "push_agendamentos": true,
  "push_pagamentos": false,
  "push_clientes": false,
  "sms_agendamentos": false,
  "sms_pagamentos": false
}'::jsonb;

-- Add comment to the columns
COMMENT ON COLUMN public.profiles.theme_preference IS 'User theme preference: light or dark';
COMMENT ON COLUMN public.profiles.notification_settings IS 'User notification preferences in JSON format';
