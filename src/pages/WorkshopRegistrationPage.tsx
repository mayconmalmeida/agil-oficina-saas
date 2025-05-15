
import React from 'react';
import { useLocation } from 'react-router-dom';
import WorkshopRegistrationForm from '@/components/registration/WorkshopRegistrationForm';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const WorkshopRegistrationPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedPlan = searchParams.get('plano') || 'Essencial';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 px-8">
            <h1 className="text-2xl font-bold text-white">Cadastro da Oficina</h1>
            <p className="text-blue-100">Preencha os dados abaixo para concluir seu cadastro</p>
          </div>
          
          <div className="p-6 md:p-8">
            <WorkshopRegistrationForm selectedPlan={selectedPlan} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WorkshopRegistrationPage;
