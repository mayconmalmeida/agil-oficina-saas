
-- Criar bucket de storage para documentos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Criar policies para o bucket de documents
CREATE POLICY "Allow public access to documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND (auth.uid())::text = SPLIT_PART(name, '/', 1));

CREATE POLICY "Allow users to update their documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND (auth.uid())::text = SPLIT_PART(name, '/', 1));

CREATE POLICY "Allow users to delete their documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND (auth.uid())::text = SPLIT_PART(name, '/', 1));

-- Adicionar coluna documents na tabela profiles se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'documents'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN documents JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;
