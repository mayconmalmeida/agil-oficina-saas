-- Script para inserir admin inicial contornando RLS
-- Execute este SQL diretamente no Supabase Dashboard

-- Temporariamente desabilitar RLS para inserir o primeiro admin
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Inserir o admin inicial
INSERT INTO public.admins (email, password_hash, role, is_active, created_at, updated_at)
VALUES (
  'admin@oficina.com',
  '$2b$12$DLumGcHXvBr5KZ1C2NhPHuPcglkXqLOEqksu4Yf.J.PpSbisFpjn.',
  'superadmin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Reabilitar RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Verificar se o admin foi inserido
SELECT id, email, role, is_active, created_at FROM public.admins WHERE email = 'admin@oficina.com';