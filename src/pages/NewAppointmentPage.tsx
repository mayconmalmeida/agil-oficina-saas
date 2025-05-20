
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const NewAppointmentPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // This is just a placeholder component that will be implemented fully later
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Here would be the actual implementation to save the appointment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Agendamento criado",
        description: "Novo agendamento criado com sucesso."
      });
      
      navigate('/agendamentos');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar o agendamento."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Novo Agendamento</h1>
        <Button variant="outline" onClick={() => navigate('/agendamentos')}>
          Voltar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Criar Agendamento</CardTitle>
          <CardDescription>
            Agende um novo serviço para um cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                Formulário de agendamento em desenvolvimento
              </p>
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Processando
                  </>
                ) : 'Agendar (Placeholder)'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAppointmentPage;
