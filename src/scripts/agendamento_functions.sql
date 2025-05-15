
CREATE OR REPLACE FUNCTION public.create_agendamentos_table()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    data_agendamento DATE NOT NULL,
    horario TEXT NOT NULL,
    cliente_id UUID REFERENCES public.clients(id),
    veiculo_id UUID,
    servico_id UUID REFERENCES public.services(id),
    observacoes TEXT,
    status TEXT DEFAULT 'agendado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can view their own agendamentos"
    ON public.agendamentos FOR SELECT
    USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can insert their own agendamentos"
    ON public.agendamentos FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Users can update their own agendamentos"
    ON public.agendamentos FOR UPDATE
    USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can delete their own agendamentos"
    ON public.agendamentos FOR DELETE
    USING (auth.uid() = user_id);
END;
$function$;
