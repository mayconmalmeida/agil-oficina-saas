import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com service key (contorna RLS)
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
// Esta é a service key que contorna RLS - você precisa obtê-la do Supabase Dashboard
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI2NjQ1MCwiZXhwIjoyMDYyODQyNDUwfQ.VGTt7zQGBaF8yVQXKOQOQOQOQOQOQOQOQOQOQOQOQOQ'; // Placeholder - você precisa da service key real

const supabase = createClient(supabaseUrl, serviceKey);

async function createAdminUser() {
  console.log('🔧 Criando usuário admin com service key...');
  
  try {
    // Hash gerado para a senha 'admin123'
    const passwordHash = '$2b$12$DLumGcHXvBr5KZ1C2NhPHuPcglkXqLOEqksu4Yf.J.PpSbisFpjn.';
    
    // Primeiro, vamos verificar se já existe
    const { data: existing, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'admin@oficina.com');
    
    if (checkError) {
      console.error('❌ Erro ao verificar admin existente:', checkError);
      return;
    }
    
    if (existing && existing.length > 0) {
      console.log('ℹ️ Admin já existe:', existing[0]);
      
      // Atualizar a senha se necessário
      const { data: updateData, error: updateError } = await supabase
        .from('admins')
        .update({ 
          password_hash: passwordHash,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', 'admin@oficina.com')
        .select();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar admin:', updateError);
      } else {
        console.log('✅ Admin atualizado:', updateData);
      }
    } else {
      // Inserir novo admin
      const { data, error } = await supabase
        .from('admins')
        .insert([
          {
            email: 'admin@oficina.com',
            password_hash: passwordHash,
            role: 'superadmin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) {
        console.error('❌ Erro ao inserir admin:', error);
      } else {
        console.log('✅ Admin criado com sucesso:', data);
      }
    }
    
    // Testar o login
    console.log('🔐 Testando login do admin...');
    const { data: loginData, error: loginError } = await supabase.rpc('validate_admin_login', {
      p_email: 'admin@oficina.com',
      p_password: 'admin123'
    });
    
    if (loginError) {
      console.error('❌ Erro no teste de login:', loginError);
    } else {
      console.log('✅ Teste de login:', loginData);
    }
    
  } catch (err) {
    console.error('💥 Erro geral:', err);
  }
}

createAdminUser();