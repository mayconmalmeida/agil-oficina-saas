
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-6">Oficina Go</h1>
            <p className="text-xl mb-8">Sistema de gestão para oficinas automotivas</p>
            <div className="space-x-4 mb-12">
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
            
            {/* Contact Information */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span>(46) 99932-4779</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span>contatooficinago@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Pato Branco - PR, Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
