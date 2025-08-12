
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SchedulingForm from '@/components/scheduling/SchedulingForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useOficinaFilters, getOficinaFilter } from '@/hooks/useOficinaFilters';

const NewSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { oficina_id, user_id, isReady } = useOficinaFilters();

  const handleSubmit = async (values: any) => {
    if (!isReady) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const filter = getOficinaFilter(oficina_id, user_id);
      if (!filter) {
        throw new Error('Filtros de oficina não disponíveis');
      }

      // Prepare agendamento data
      const agendamentoData = {
        user_id: user.id,
        oficina_id: oficina_id,
        data_agendamento: values.data,
        horario: values.horario,
        cliente_id: values.cliente_id,
        servico_id: values.servico_id,
        observacoes: values.observacoes || '',
        status: 'agendado'
      };

      console.log('Dados do agendamento:', agendamentoData);

      const { error } = await supabase
        .from('agendamentos')
        .insert([agendamentoData]);

      if (error) throw error;

      toast({
        title: "Agendamento criado",
        description: "Agendamento foi criado com sucesso.",
      });

      // Redirecionar para a lista de agendamentos
      navigate('/dashboard/agendamentos');
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
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
