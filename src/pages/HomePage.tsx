
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Sistema de Gestão para Oficinas
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Gerencie clientes, orçamentos, serviços e muito mais
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
