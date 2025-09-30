const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://yjhcozddtbpzvnppcggf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlanConfigurations() {
  try {
    console.log('Verificando tabela plan_configurations...');
    
    const { data, error } = await supabase
      .from('plan_configurations')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Erro ao acessar plan_configurations:', error.message);
      console.log('Código do erro:', error.code);
      console.log('Detalhes:', error.details);
    } else {
      console.log('✅ Tabela plan_configurations existe!');
      console.log('Número de registros encontrados:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Primeiro registro:', JSON.stringify(data[0], null, 2));
      }
    }
  } catch (err) {
    console.log('❌ Erro geral:', err.message);
  }
}

checkPlanConfigurations();