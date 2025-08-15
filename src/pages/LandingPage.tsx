
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-6">Oficina Go</h1>
        <p className="text-xl mb-8">Sistema de gestão para oficinas automotivas</p>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Entrar
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
              Cadastrar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
