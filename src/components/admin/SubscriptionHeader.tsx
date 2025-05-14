
import React from 'react';
import { Button } from "@/components/ui/button";

type SubscriptionHeaderProps = {
  onBack: () => void;
};

const SubscriptionHeader = ({ onBack }: SubscriptionHeaderProps) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Gerenciamento de Assinaturas</h1>
        <Button onClick={onBack}>
          Voltar ao Dashboard
        </Button>
      </div>
    </header>
  );
};

export default SubscriptionHeader;
