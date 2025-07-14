import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface AdminSubscriptionsHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  isLoading: boolean;
}

const AdminSubscriptionsHeader = ({ 
  onBack, 
  onRefresh, 
  onCreateNew, 
  isLoading 
}: AdminSubscriptionsHeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Assinaturas</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Assinatura
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionsHeader;