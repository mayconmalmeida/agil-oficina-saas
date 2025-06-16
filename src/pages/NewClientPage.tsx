
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ClientForm from '@/components/clients/ClientForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const NewClientPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('clients')
        .insert({
          nome: values.nome,
          tipo: values.tipo,
          documento: values.documento,
          telefone: values.telefone,
          email: values.email,
          veiculo: values.veiculo,
          marca: values.marca,
          modelo: values.modelo,
          ano: values.ano,
          placa: values.placa,
          cor: values.cor,
          user_id: user.id
        });

      if (error) throw error;

      setSaveSuccess(true);
      toast({
        title: "Cliente adicionado",
        description: "Cliente foi adicionado com sucesso.",
      });

      setTimeout(() => {
        navigate('/dashboard/clientes');
      }, 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar cliente",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate('/dashboard/clientes');
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Novo Cliente</CardTitle>
          <CardDescription>
            Adicione um novo cliente ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm 
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            isLoading={isLoading}
            saveSuccess={saveSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewClientPage;
