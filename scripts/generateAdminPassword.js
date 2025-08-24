
// Script para gerar hash bcrypt de senhas de admin
// Execute com: node scripts/generateAdminPassword.js "sua_senha_aqui"

const bcrypt = require('bcryptjs');

async function generateAdminPassword(password) {
  if (!password) {
    console.error('❌ Por favor, forneça uma senha como argumento');
    console.log('Uso: node scripts/generateAdminPassword.js "sua_senha_aqui"');
    process.exit(1);
  }

  try {
    const saltRounds = 12; // Custo alto para maior segurança
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Hash bcrypt gerado com sucesso:');
    console.log('Hash:', hash);
    console.log('');
    console.log('Para usar este hash, execute o seguinte SQL no Supabase:');
    console.log(`INSERT INTO public.admins (email, password_hash, role) VALUES ('email@exemplo.com', '${hash}', 'admin');`);
    console.log('');
    console.log('Ou para atualizar uma senha existente:');
    console.log(`UPDATE public.admins SET password_hash = '${hash}' WHERE email = 'email@exemplo.com';`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar hash:', error);
    process.exit(1);
  }
}

const password = process.argv[2];
generateAdminPassword(password);
