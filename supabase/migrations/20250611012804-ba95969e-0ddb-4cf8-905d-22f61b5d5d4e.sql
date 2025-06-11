
-- Adicionar campo de link de afiliado na tabela plan_configurations
ALTER TABLE public.plan_configurations 
ADD COLUMN affiliate_link TEXT;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.plan_configurations.affiliate_link IS 'Link de afiliado da Cakto para o plano';
