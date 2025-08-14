
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

const SubscriptionPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Assinatura</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Assinatura</CardTitle>
          <CardDescription>
            Visualize e gerencie sua assinatura do OficinaGO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Painel de assinatura em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPage;
