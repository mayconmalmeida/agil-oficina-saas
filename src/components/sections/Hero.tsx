
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 pt-16 pb-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900 mix-blend-multiply" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
        <div className="sm:text-center lg:text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Gestão completa para sua</span>
            <span className="block text-blue-200">oficina mecânica</span>
          </h1>
          <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl max-w-2xl sm:mx-auto lg:mx-0">
            Simplifique seu dia a dia, organize clientes, orçamentos e serviços em um só lugar.
            OficinaÁgil é a solução que sua oficina precisa para crescer.
          </p>
          <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/cadastro-oficina?plano=Essencial"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg"
            >
              Começar agora
            </Link>
            <Link
              to="#funcionalidades"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 bg-opacity-20 hover:bg-opacity-30 md:py-4 md:text-lg"
            >
              Saiba mais
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
          <div className="mt-6 text-blue-100 text-sm">
            <span className="italic">Experimente grátis por 7 dias, sem compromisso.</span>
          </div>
        </div>
      </div>
      
      <div className="relative mt-16 md:mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative shadow-xl rounded-lg overflow-hidden">
          <div className="absolute inset-0 h-full w-full bg-gradient-to-tr from-blue-900 to-transparent opacity-90"></div>
          <img
            className="w-full"
            src="https://images.unsplash.com/photo-1613329671121-5d1cf551cc3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
            alt="Oficina mecânica com sistema de gestão"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="sr-only">Ver demonstração</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
