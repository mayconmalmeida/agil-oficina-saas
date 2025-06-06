
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

interface PlansHeaderProps {
  onBack: () => void;
  onCreateNew: () => void;
}

const PlansHeader: React.FC<PlansHeaderProps> = ({ onBack, onCreateNew }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        variant="outline"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao Dashboard
      </Button>
      <h1 className="text-3xl font-bold text-gray-900">
        Gerenciar Planos
      </h1>
      <div className="ml-auto">
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>
    </div>
  );
};

export default PlansHeader;
