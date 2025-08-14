
-- Verificar se existe algum admin na tabela
SELECT * FROM public.admins;

-- Se não houver registros, inserir o admin padrão
INSERT INTO public.admins (id, email, password, is_superadmin)
VALUES 
  (gen_random_uuid(), 'mayconintermediacao@gmail.com', 'admin123', true)
ON CONFLICT (email) DO NOTHING;
