
-- Create table for IA support messages
CREATE TABLE public.ia_suporte_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.ia_suporte_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for the IA support messages
CREATE POLICY "Users can view their own IA support messages" 
  ON public.ia_suporte_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own IA support messages" 
  ON public.ia_suporte_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own IA support messages" 
  ON public.ia_suporte_messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own IA support messages" 
  ON public.ia_suporte_messages 
  FOR DELETE 
  USING (auth.uid() = user_id);
