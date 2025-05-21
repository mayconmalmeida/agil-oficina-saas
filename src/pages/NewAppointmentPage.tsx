
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NewAppointmentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Novo Agendamento</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Formulário de Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Componente de agendamento em desenvolvimento. Esta página será implementada em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewAppointmentPage;
