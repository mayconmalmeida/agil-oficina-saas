
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SchedulingForm from '@/components/scheduling/SchedulingForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const NewSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Aqui você implementaria a lógica de criação do agendamento
      console.log('Dados do agendamento:', values);

      toast({
        title: "Agendamento criado",
        description: "Agendamento foi criado com sucesso.",
      });

      // Redirecionar para a lista de agendamentos
      navigate('/dashboard/agendamentos');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar agendamento",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Novo Agendamento</CardTitle>
          <CardDescription>
            Agende um novo serviço para um cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchedulingForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            clients={[]}
            services={[]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSchedulePage;
