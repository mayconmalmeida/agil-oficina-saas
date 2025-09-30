// Debug script para testar o dashboard admin
console.log('🔍 Testando acesso ao dashboard admin...');

// Simular dados de admin no localStorage
const adminSession = {
  user: {
    id: 'test-admin-id',
    email: 'admin@test.com',
    role: 'admin',
    isAdmin: true,
    name: 'Admin Test'
  },
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

localStorage.setItem('admin_session', JSON.stringify(adminSession));

console.log('✅ Sessão admin simulada criada:', adminSession);
console.log('🔗 Acesse: http://localhost:8081/admin');
console.log('📝 Verifique o console do navegador para erros');