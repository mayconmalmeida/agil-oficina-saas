
-- Insere perfis para todos usuários existentes no Auth que ainda não têm perfil
INSERT INTO public.profiles (id, email, created_at)
SELECT u.id, u.email, timezone('utc', now())
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
