-- Criar tabela de histórico de veículos
CREATE TABLE public.historicos_veiculo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cliente_id UUID NOT NULL,
  veiculo_id UUID NOT NULL,
  servico_id UUID,
  km_atual INTEGER NOT NULL,
  km_proxima INTEGER,
  data_troca DATE NOT NULL,
  tipo_oleo TEXT NOT NULL,
  observacoes TEXT,
  qrcode_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.historicos_veiculo ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own historicos_veiculo" 
ON public.historicos_veiculo 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own historicos_veiculo" 
ON public.historicos_veiculo 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own historicos_veiculo" 
ON public.historicos_veiculo 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own historicos_veiculo" 
ON public.historicos_veiculo 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policy for public access to historicos (for QR code page)
CREATE POLICY "Public can view historicos for QR code" 
ON public.historicos_veiculo 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_historicos_veiculo_updated_at
BEFORE UPDATE ON public.historicos_veiculo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();