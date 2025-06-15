
-- Atualiza a função para só inserir perfil se não existir
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger AS $$
begin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new.id) THEN
    insert into public.profiles (id, email, created_at)
    values (
      new.id,
      new.email,
      timezone('utc', now())
    );
  END IF;
  return new;
end;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
