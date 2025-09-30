import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - usando produção
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertAdmin() {
  console.log('🔧 Inserindo usuário admin na tabela admins...');
  
  try {
    // Hash gerado para a senha 'admin123'
    const passwordHash = '$2b$12$DLumGcHXvBr5KZ1C2NhPHuPcglkXqLOEqksu4Yf.J.PpSbisFpjn.';
    
    const { data, error } = await supabase
      .from('admins')
      .insert([
        {
          email: 'admin@oficina.com',
          password_hash: passwordHash,
          role: 'superadmin',
          is_active: true
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir admin:', error);
    } else {
      console.log('✅ Admin inserido com sucesso:', data);
      
      // Agora vamos testar o login
      console.log('🔐 Testando login do admin...');
      const { data: loginData, error: loginError } = await supabase.rpc('validate_admin_login', {
        p_email: 'admin@oficina.com',
        p_password: 'admin123'
      });
      
      if (loginError) {
        console.error('❌ Erro no teste de login:', loginError);
      } else {
        console.log('✅ Teste de login bem-sucedido:', loginData);
      }
    }
    
  } catch (err) {
    console.error('💥 Erro geral:', err);
  }
}

insertAdmin();