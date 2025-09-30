// Teste simples para verificar o fluxo de login admin
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminFlow() {
  console.log('🔍 Testando fluxo de login admin...');
  
  try {
    // Testar se a função get_admin_stats existe
    console.log('📊 Testando função get_admin_stats...');
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_admin_stats');
    
    if (statsError) {
      console.error('❌ Erro na função get_admin_stats:', statsError);
    } else {
      console.log('✅ Função get_admin_stats funcionando:', statsData);
    }
    
    // Testar se a função is_user_admin existe
    console.log('👤 Testando função is_user_admin...');
    const { data: isAdminData, error: isAdminError } = await supabase
      .rpc('is_user_admin', { user_email: 'test@example.com' });
    
    if (isAdminError) {
      console.error('❌ Erro na função is_user_admin:', isAdminError);
    } else {
      console.log('✅ Função is_user_admin funcionando:', isAdminData);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testAdminFlow();