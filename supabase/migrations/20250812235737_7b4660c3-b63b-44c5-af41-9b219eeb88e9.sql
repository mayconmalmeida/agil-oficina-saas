
-- Primeiro, vamos verificar os dados dos dois user_ids
-- SELECT * FROM oficinas WHERE user_id IN ('2e878bbe-23ce-4865-a7f1-bfc89889231c', '307c8e18-7d29-413a-9b28-0cf18df2aed8');

-- Unificar os registros mantendo o user_id mais antigo e mesclando os dados
DO $$
DECLARE
    user_id_principal UUID := '2e878bbe-23ce-4865-a7f1-bfc89889231c';
    user_id_duplicado UUID := '307c8e18-7d29-413a-9b28-0cf18df2aed8';
    oficina_principal RECORD;
    oficina_duplicada RECORD;
BEGIN
    -- Buscar os dados das duas oficinas
    SELECT * INTO oficina_principal FROM oficinas WHERE user_id = user_id_principal;
    SELECT * INTO oficina_duplicada FROM oficinas WHERE user_id = user_id_duplicado;
    
    -- Se ambas existem, mesclar os dados
    IF oficina_principal.id IS NOT NULL AND oficina_duplicada.id IS NOT NULL THEN
        -- Atualizar a oficina principal com dados mais completos
        UPDATE oficinas 
        SET 
            nome_oficina = COALESCE(oficina_principal.nome_oficina, oficina_duplicada.nome_oficina),
            cnpj = COALESCE(oficina_principal.cnpj, oficina_duplicada.cnpj),
            telefone = COALESCE(oficina_principal.telefone, oficina_duplicada.telefone),
            email = COALESCE(oficina_principal.email, oficina_duplicada.email),
            endereco = COALESCE(oficina_principal.endereco, oficina_duplicada.endereco),
            cidade = COALESCE(oficina_principal.cidade, oficina_duplicada.cidade),
            estado = COALESCE(oficina_principal.estado, oficina_duplicada.estado),
            responsavel = COALESCE(oficina_principal.responsavel, oficina_duplicada.responsavel),
            cep = COALESCE(oficina_principal.cep, oficina_duplicada.cep),
            plano = COALESCE(oficina_principal.plano, oficina_duplicada.plano),
            logo_url = COALESCE(oficina_principal.logo_url, oficina_duplicada.logo_url),
            is_active = COALESCE(oficina_principal.is_active, oficina_duplicada.is_active),
            trial_ends_at = COALESCE(oficina_principal.trial_ends_at, oficina_duplicada.trial_ends_at)
        WHERE user_id = user_id_principal;
        
        -- Atualizar registros relacionados para apontar para o user_id principal
        UPDATE clients SET user_id = user_id_principal WHERE user_id = user_id_duplicado;
        UPDATE services SET user_id = user_id_principal WHERE user_id = user_id_duplicado;
        UPDATE agendamentos SET user_id = user_id_principal WHERE user_id = user_id_duplicado;
        UPDATE orcamentos SET user_id = user_id_principal WHERE user_id = user_id_duplicado;
        UPDATE veiculos SET user_id = user_id_principal WHERE user_id = user_id_duplicado;
        UPDATE user_subscriptions SET user_id = user_id_principal WHERE user_id = user_id_duplicado;
        
        -- Remover a oficina duplicada
        DELETE FROM oficinas WHERE user_id = user_id_duplicado;
        
        -- Atualizar o profile para usar o user_id principal
        UPDATE profiles SET id = user_id_principal WHERE id = user_id_duplicado;
        
        RAISE NOTICE 'Unificação concluída. User_id % foi mesclado com % e removido.', user_id_duplicado, user_id_principal;
    END IF;
END $$;
