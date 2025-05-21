
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NewAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Novo Agendamento</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/agendamentos')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Agendar Novo Atendimento</CardTitle>
          <CardDescription>
            Preencha os dados para agendar um atendimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Formulário de agendamento em desenvolvimento.</p>
            <Button 
              onClick={() => navigate('/agendamentos')}
              className="mt-4"
            >
              Voltar para Agendamentos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAppointmentPage;
