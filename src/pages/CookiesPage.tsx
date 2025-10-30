import React from 'react';

const CookiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Política de Cookies</h1>
        <p className="text-gray-600 mb-6">Última atualização: Outubro/2025</p>
        <div className="prose max-w-none">
          <p>
            Utilizamos cookies para melhorar sua experiência e garantir funcionalidades essenciais.
            Alguns cookies são necessários para autenticação e segurança.
          </p>
          <h2>Tipos de cookies</h2>
          <ul>
            <li>Essenciais: necessários para login e operação do site.</li>
            <li>Preferências: lembram configurações como tema.</li>
            <li>Desempenho: ajudam a entender uso e melhorar o serviço.</li>
          </ul>
          <h2>Gerenciamento</h2>
          <p>
            Você pode controlar cookies pelo seu navegador. Note que desativar cookies essenciais
            pode limitar funcionalidades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;