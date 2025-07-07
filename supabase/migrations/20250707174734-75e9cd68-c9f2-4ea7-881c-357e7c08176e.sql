-- Inserir o usuário admin no sistema de auth do Supabase
-- Primeiro, vamos verificar se o usuário já existe no auth.users
DO $$
DECLARE
    user_exists boolean;
BEGIN
    -- Verifica se o usuário já existe
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE id = '1f9c340e-4c16-4136-b213-0c8106e73811'
    ) INTO user_exists;
    
    -- Se não existir, criar o usuário
    IF NOT user_exists THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '1f9c340e-4c16-4136-b213-0c8106e73811',
            'mayconintermediacao@gmail.com',
            crypt('admin123', gen_salt('bf')), -- Senha: admin123
            now(),
            now(),
            now(),
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'Usuário admin criado com sucesso! Email: mayconintermediacao@gmail.com, Senha: admin123';
    ELSE
        RAISE NOTICE 'Usuário admin já existe!';
    END IF;
END $$;