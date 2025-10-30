import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
        <p className="text-gray-600 mb-6">Última atualização: Outubro/2025</p>
        <div className="prose max-w-none">
          <p>
            Valorizamos sua privacidade. Esta política descreve como coletamos, utilizamos e
            protegemos seus dados pessoais ao utilizar a plataforma Oficina Go.
          </p>
          <h2>Coleta de dados</h2>
          <p>
            Coletamos informações fornecidas por você (como nome, email, dados da oficina) e dados
            de uso da aplicação para oferecer e melhorar nossos serviços.
          </p>
          <h2>Uso de dados</h2>
          <p>
            Utilizamos seus dados para autenticação, operação das funcionalidades, suporte e
            comunicação. Não vendemos seus dados a terceiros.
          </p>
          <h2>Compartilhamento</h2>
          <p>
            Dados podem ser compartilhados com provedores de infraestrutura (por exemplo, autenticação
            e banco de dados) exclusivamente para prestação dos serviços.
          </p>
          <h2>Direitos do titular</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão de seus dados. Para exercer seus
            direitos, entre em contato pelo formulário em <a href="#contato">Contato</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;