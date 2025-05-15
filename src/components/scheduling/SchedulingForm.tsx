
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import ClientSelector from './form-sections/ClientSelector';
import ServiceSelector from './form-sections/ServiceSelector';
import DateTimeSelector from './form-sections/DateTimeSelector';
import NotesField from './form-sections/NotesField';

// Define schema
export const schedulingSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente"),
  veiculo_id: z.string().min(1, "Selecione um veículo"),
  servico_id: z.string().min(1, "Selecione um serviço"),
  data: z.date(),
  horario: z.string().min(1, "Selecione um horário"),
  observacoes: z.string().optional(),
});

export type SchedulingFormValues = z.infer<typeof schedulingSchema>;

interface SchedulingFormProps {
  onSubmit: (data: SchedulingFormValues) => Promise<void>;
  isLoading: boolean;
  clients: any[];
  services: any[];
}

const SchedulingForm: React.FC<SchedulingFormProps> = ({ onSubmit, isLoading, clients, services }) => {
  const methods = useForm<SchedulingFormValues>({
    resolver: zodResolver(schedulingSchema),
    defaultValues: {
      cliente_id: '',
      veiculo_id: '',
      servico_id: '',
      data: new Date(),
      horario: '',
      observacoes: '',
    },
  });

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Novo Agendamento</CardTitle>
      </CardHeader>
      
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <ClientSelector clients={clients} />
            <ServiceSelector services={services} />
            <DateTimeSelector />
            <NotesField />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Agendando...
                </>
              ) : (
                'Agendar'
              )}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
};

export default SchedulingForm;
