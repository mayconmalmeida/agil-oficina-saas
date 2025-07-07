-- Políticas RLS para admins acessarem dados da tabela oficinas
DROP POLICY IF EXISTS "Admins can view all oficinas" ON public.oficinas;
CREATE POLICY "Admins can view all oficinas" 
  ON public.oficinas 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can update all oficinas" ON public.oficinas;
CREATE POLICY "Admins can update all oficinas" 
  ON public.oficinas 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Política para atualizar oficina_id automaticamente ao inserir
CREATE OR REPLACE FUNCTION public.auto_set_oficina_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Se oficina_id não está definido, buscar automaticamente
  IF NEW.oficina_id IS NULL THEN
    NEW.oficina_id := public.get_user_oficina_id();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para definir oficina_id automaticamente
DROP TRIGGER IF EXISTS auto_set_oficina_id_trigger ON public.clients;
CREATE TRIGGER auto_set_oficina_id_trigger
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_oficina_id();