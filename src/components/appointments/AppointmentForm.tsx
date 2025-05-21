
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Form } from '@/components/ui/form';

// Basic schema for appointments
const appointmentSchema = z.object({
  date: z.date({
    required_error: "A data é obrigatória",
  }),
  time: z.string().min(1, "O horário é obrigatório"),
  clientId: z.string().min(1, "O cliente é obrigatório"),
  serviceId: z.string().min(1, "O serviço é obrigatório"),
  notes: z.string().optional()
});

type AppointmentValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  onSubmit: (data: AppointmentValues) => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const form = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      notes: ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields will be implemented here */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            <Calendar className="mr-2 h-4 w-4" />
            Agendar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentForm;
