
-- Add missing columns to suppliers table
ALTER TABLE suppliers 
ADD COLUMN cnpj text,
ADD COLUMN address text,
ADD COLUMN cep text,
ADD COLUMN city text,
ADD COLUMN state text;
