const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  console.log('🔧 Criando usuário admin...');
  
  try {
    // Primeiro, vamos verificar se já existe um usuário admin
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('full_name', 'Admin Test')
      .single();

    if (existingUser) {
      console.log('✅ Usuário admin já existe:', existingUser);
      
      // Atualizar para garantir que é admin
      const { data: updatedUser, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          plano: 'premium'
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário admin:', updateError);
      } else {
        console.log('✅ Usuário admin atualizado:', updatedUser);
      }
      return;
    }

    // Se não existe, criar um novo usuário admin
    const { data: newUser, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: 'admin-test-id-' + Date.now(),
        nome_oficina: 'Admin Workshop',
        full_name: 'Admin Test',
        telefone: '46991270777',
        endereco: 'Admin Address',
        cidade: 'Admin City',
        estado: 'PR',
        cep: '85000-000',
        plano: 'premium'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar usuário admin:', insertError);
    } else {
      console.log('✅ Usuário admin criado com sucesso:', newUser);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createAdminUser();