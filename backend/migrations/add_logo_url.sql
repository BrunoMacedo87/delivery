-- Adiciona a coluna logo_url na tabela empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url VARCHAR;
