
import React, { useEffect } from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';

// Define schema
export const schedulingSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente"),
  servico_id: z.string().min(1, "Selecione um serviço"),
  data: z.string().min(1, "Selecione uma data"),
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
  const isMobile = useIsMobile();
  const methods = useForm<SchedulingFormValues>({
    resolver: zodResolver(schedulingSchema),
    defaultValues: {
      cliente_id: '',
      servico_id: '',
      data: '',
      horario: '',
      observacoes: '',
    },
  });

  // Handle form errors
  const formErrors = methods.formState.errors;
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      console.log('Form errors:', formErrors);
    }
  }, [formErrors]);

  return (
    <Card className={`w-full ${isMobile ? 'mx-2' : 'max-w-4xl mx-auto'}`}>
      <CardHeader>
        <CardTitle className={isMobile ? 'text-xl' : 'text-2xl'}>Novo Agendamento</CardTitle>
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
