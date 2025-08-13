
-- Inserir o email como administrador na tabela admins
INSERT INTO public.admins (email, password, is_superadmin)
VALUES ('mayconintermediacao@gmail.com', 'admin123', true)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  is_superadmin = EXCLUDED.is_superadmin;
