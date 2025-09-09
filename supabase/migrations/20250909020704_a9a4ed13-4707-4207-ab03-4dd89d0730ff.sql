-- CORREÇÃO DE SEGURANÇA: Remover política pública insegura
DROP POLICY IF EXISTS "Public can view historicos for QR code" ON public.historicos_veiculo;

-- Política segura: apenas usuários autenticados podem ver seus próprios históricos
-- A página pública usará uma edge function com service role para acesso controlado