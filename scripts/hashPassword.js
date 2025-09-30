
// Script para gerar hash bcrypt de senhas de admin
// Execute com: node scripts/hashPassword.js "sua_senha_aqui"

import bcrypt from 'bcryptjs';

async function hashPassword(password) {
  if (!password) {
    console.error('❌ Por favor, forneça uma senha como argumento');
    console.log('Uso: node scripts/hashPassword.js "sua_senha_aqui"');
    process.exit(1);
  }

  try {
    const saltRounds = 12; // Custo alto para maior segurança
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Hash bcrypt gerado com sucesso:');
    console.log('Hash:', hash);
    console.log('');
    console.log('Para usar este hash, execute o seguinte SQL no Supabase:');
    console.log(`UPDATE public.admins SET password_hash = '${hash}' WHERE email = 'seu_email@exemplo.com';`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar hash:', error);
    process.exit(1);
  }
}

const password = process.argv[2];
hashPassword(password);
