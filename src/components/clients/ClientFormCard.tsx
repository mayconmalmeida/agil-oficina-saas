
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ClientForm from './ClientForm';

interface ClientFormCardProps {
  onSubmit: (values: any) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
  saveSuccess: boolean;
}

const ClientFormCard: React.FC<ClientFormCardProps> = ({
  onSubmit,
  onSkip,
  isLoading,
  saveSuccess
}) => {
  return (
    <Card className={`transition-all duration-300 ${saveSuccess ? 'border-green-500 shadow-md' : ''}`}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Dados do Cliente</span>
          {saveSuccess && <CheckCircle className="h-5 w-5 text-green-500 animate-fade-in" />}
        </CardTitle>
        <CardDescription>
          Informações para contato e identificação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClientForm 
          onSubmit={onSubmit}
          onSkip={onSkip}
          isLoading={isLoading}
          saveSuccess={saveSuccess}
        />
      </CardContent>
    </Card>
  );
};

export default ClientFormCard;
