
-- Criar tabela de agendamentos primeiro
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  cliente_id UUID REFERENCES clients(id),
  oficina_id UUID REFERENCES oficinas(id),
  data_agendamento DATE NOT NULL,
  horario TEXT NOT NULL,
  data_hora TIMESTAMPTZ,
  servico_id UUID REFERENCES services(id),
  descricao_servico TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'concluido', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para agendamentos
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para agendamentos
CREATE POLICY "Users can view their own agendamentos"
  ON public.agendamentos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agendamentos"
  ON public.agendamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agendamentos"
  ON public.agendamentos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agendamentos"
  ON public.agendamentos FOR DELETE
  USING (auth.uid() = user_id);

-- Criar tabela de campanhas de marketing
CREATE TABLE public.campanhas_marketing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  oficina_id UUID REFERENCES oficinas(id),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo_envio TEXT NOT NULL CHECK (tipo_envio IN ('whatsapp', 'email')),
  data_agendada TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'enviado', 'falhou')),
  clientes_ids UUID[] DEFAULT '{}',
  arquivo_url TEXT,
  tipo_arquivo TEXT CHECK (tipo_arquivo IN ('imagem', 'video')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para campanhas
ALTER TABLE public.campanhas_marketing ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para campanhas_marketing
CREATE POLICY "Users can view their own campaigns"
  ON public.campanhas_marketing FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON public.campanhas_marketing FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.campanhas_marketing FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.campanhas_marketing FOR DELETE
  USING (auth.uid() = user_id);

-- Criar bucket de storage para campanhas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campanhas', 'campanhas', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para campanhas
CREATE POLICY "Users can upload campaign files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'campanhas' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view campaign files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campanhas');

CREATE POLICY "Users can update campaign files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'campanhas' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete campaign files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'campanhas' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_agendamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE PROCEDURE update_agendamentos_updated_at();

CREATE OR REPLACE FUNCTION update_campanhas_marketing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campanhas_marketing_updated_at
  BEFORE UPDATE ON public.campanhas_marketing
  FOR EACH ROW EXECUTE PROCEDURE update_campanhas_marketing_updated_at();
