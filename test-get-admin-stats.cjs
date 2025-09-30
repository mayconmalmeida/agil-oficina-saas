const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler variáveis de ambiente do arquivo .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

console.log('🔧 Variáveis carregadas:');
console.log('📍 VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('🔑 VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Definida' : 'Não definida');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testGetAdminStats() {
  console.log('🔍 Testando função get_admin_stats...');
  console.log('📍 URL:', process.env.VITE_SUPABASE_URL);
  
  try {
    const { data, error } = await supabase.rpc('get_admin_stats');
    
    if (error) {
      console.error('❌ Erro na função RPC:', error);
      console.error('📋 Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }
    
    console.log('✅ Função executada com sucesso!');
    console.log('📊 Dados retornados:', JSON.stringify(data, null, 2));
    console.log('🔍 Tipo dos dados:', typeof data);
    console.log('🔍 É array?', Array.isArray(data));
    
    if (typeof data === 'object' && data !== null) {
      console.log('🔑 Chaves do objeto:', Object.keys(data));
    }
    
  } catch (err) {
    console.error('❌ Erro na execução:', err);
  }
}

testGetAdminStats();