import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Termos de Uso</h1>
        <p className="text-gray-600 mb-6">Última atualização: Outubro/2025</p>
        <div className="prose max-w-none">
          <p>
            Ao utilizar a plataforma Oficina Go, você concorda com estes termos. Leia atentamente
            para compreender as condições de uso dos serviços.
          </p>
          <h2>Conta e acesso</h2>
          <p>
            Você é responsável por manter suas credenciais seguras e por toda atividade realizada
            em sua conta.
          </p>
          <h2>Licença</h2>
          <p>
            Concedemos uma licença limitada para uso do serviço. É proibida a engenharia reversa e
            uso para fins não autorizados.
          </p>
          <h2>Limitação de responsabilidade</h2>
          <p>
            O serviço é fornecido "como está". Não nos responsabilizamos por perdas indiretas
            decorrentes do uso.
          </p>
          <h2>Contato</h2>
          <p>
            Em caso de dúvidas, utilize a seção <a href="#contato">Contato</a> da página inicial.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;