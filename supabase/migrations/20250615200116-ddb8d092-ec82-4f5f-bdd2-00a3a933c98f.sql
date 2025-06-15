
-- Criação da tabela de oficinas (cada linha representa uma empresa/oficina "cliente" do SaaS)
CREATE TABLE IF NOT EXISTS public.oficinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- vínculo ao auth.users.id
  nome_oficina text,
  cnpj text,
  telefone text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Garantir que user_id em oficinas seja único para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS oficinas_user_id_idx ON public.oficinas(user_id);

-- Ativar Row Level Security
ALTER TABLE public.oficinas ENABLE ROW LEVEL SECURITY;

-- Oficinas só podem ler/escrever seus próprios dados
CREATE POLICY "Oficina pode acessar seus próprios dados" 
  ON public.oficinas 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Oficina pode atualizar seus próprios dados" 
  ON public.oficinas 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Oficina pode deletar seus próprios dados"
  ON public.oficinas
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Oficina pode criar seu registro"
  ON public.oficinas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Atualizar tabela clients:
-- Adicionar coluna oficina_id e vincular a oficinas.id
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS oficina_id uuid;

-- Criar índice e RLS para multi-tenant
CREATE INDEX IF NOT EXISTS clients_oficina_id_idx ON public.clients(oficina_id);

-- Exemplo de política: cada oficina SÓ vê/manipula seus próprios clientes
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Oficina só acessa seus clientes"
  ON public.clients
  FOR SELECT USING (
    oficina_id IS NOT NULL AND
    oficina_id IN (SELECT id FROM public.oficinas WHERE user_id = auth.uid())
  );
CREATE POLICY "Oficina só cria seus clientes"
  ON public.clients
  FOR INSERT WITH CHECK (
    oficina_id IS NOT NULL AND
    oficina_id IN (SELECT id FROM public.oficinas WHERE user_id = auth.uid())
  );
CREATE POLICY "Oficina só altera seus clientes"
  ON public.clients
  FOR UPDATE USING (
    oficina_id IS NOT NULL AND
    oficina_id IN (SELECT id FROM public.oficinas WHERE user_id = auth.uid())
  );
CREATE POLICY "Oficina só deleta seus clientes"
  ON public.clients
  FOR DELETE USING (
    oficina_id IS NOT NULL AND
    oficina_id IN (SELECT id FROM public.oficinas WHERE user_id = auth.uid())
  );

-- Observação: se já tem dados em clients, será necessário migrar o relacionamento antigo para oficina_id.
