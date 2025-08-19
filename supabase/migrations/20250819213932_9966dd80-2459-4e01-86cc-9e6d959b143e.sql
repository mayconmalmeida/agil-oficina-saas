
-- Tabelas para o módulo financeiro
CREATE TABLE IF NOT EXISTS public.contas_receber (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  cliente_id UUID REFERENCES public.clients(id),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente', -- pendente, pago, vencido
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente', -- pendente, pago, vencido
  categoria TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fechamento_caixa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data_fechamento DATE NOT NULL,
  valor_inicial NUMERIC DEFAULT 0,
  total_entradas NUMERIC DEFAULT 0,
  total_saidas NUMERIC DEFAULT 0,
  saldo_final NUMERIC DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, data_fechamento)
);

CREATE TABLE IF NOT EXISTS public.pagamentos_manuais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ordem_servico_id UUID REFERENCES public.ordens_servico(id),
  valor NUMERIC NOT NULL,
  forma_pagamento TEXT NOT NULL, -- dinheiro, pix, cartao_credito, cartao_debito
  data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS policies para contas_receber
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contas_receber"
  ON public.contas_receber FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contas_receber"
  ON public.contas_receber FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contas_receber"
  ON public.contas_receber FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contas_receber"
  ON public.contas_receber FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies para contas_pagar
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contas_pagar"
  ON public.contas_pagar FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contas_pagar"
  ON public.contas_pagar FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contas_pagar"
  ON public.contas_pagar FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contas_pagar"
  ON public.contas_pagar FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies para fechamento_caixa
ALTER TABLE public.fechamento_caixa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fechamento_caixa"
  ON public.fechamento_caixa FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fechamento_caixa"
  ON public.fechamento_caixa FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fechamento_caixa"
  ON public.fechamento_caixa FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies para pagamentos_manuais
ALTER TABLE public.pagamentos_manuais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pagamentos_manuais"
  ON public.pagamentos_manuais FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pagamentos_manuais"
  ON public.pagamentos_manuais FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_contas_receber_updated_at
  BEFORE UPDATE ON public.contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_pagar_updated_at
  BEFORE UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
