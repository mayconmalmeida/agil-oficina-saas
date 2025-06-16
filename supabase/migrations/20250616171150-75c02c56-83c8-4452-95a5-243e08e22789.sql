
-- Criar tabela de veículos centralizada
CREATE TABLE public.veiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  placa TEXT NOT NULL UNIQUE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano TEXT NOT NULL,
  cor TEXT,
  kilometragem TEXT,
  tipo_combustivel TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para que usuários vejam apenas seus próprios veículos
CREATE POLICY "Users can view their own vehicles" 
  ON public.veiculos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vehicles" 
  ON public.veiculos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles" 
  ON public.veiculos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles" 
  ON public.veiculos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_veiculos_cliente_id ON public.veiculos(cliente_id);
CREATE INDEX idx_veiculos_user_id ON public.veiculos(user_id);
CREATE INDEX idx_veiculos_placa ON public.veiculos(placa);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_veiculos_updated_at
  BEFORE UPDATE ON public.veiculos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrar dados existentes da tabela clients para veiculos
INSERT INTO public.veiculos (cliente_id, placa, marca, modelo, ano, cor, kilometragem, user_id)
SELECT 
  id as cliente_id,
  placa,
  marca,
  modelo,
  ano,
  cor,
  kilometragem,
  user_id
FROM public.clients 
WHERE marca IS NOT NULL 
  AND modelo IS NOT NULL 
  AND ano IS NOT NULL 
  AND placa IS NOT NULL
  AND placa != '';
