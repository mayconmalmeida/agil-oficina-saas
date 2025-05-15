
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Loading from '@/components/ui/loading';

// Define interfaces
interface Client {
  id: string;
  nome: string;
}

interface Service {
  id: string;
  nome: string;
  tipo: string;
}

interface Vehicle {
  id: string;
  cliente_nome: string;
  placa: string;
  marca: string;
  modelo: string;
}

// Time slots for appointment
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

// Define the form schema
const scheduleSchema = z.object({
  data: z.date({
    required_error: "Por favor, selecione uma data",
  }),
  horario: z.string().min(1, "Por favor, selecione um horário"),
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  veiculo_id: z.string().min(1, "Veículo é obrigatório"),
  servico_id: z.string().min(1, "Tipo de serviço é obrigatório"),
  observacoes: z.string().optional(),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

const SchedulingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      observacoes: '',
    }
  });
  
  // Watch for client selection to filter vehicles
  const selectedClientId = form.watch('cliente_id');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Fetch clients
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, nome')
          .order('nome');
          
        if (clientError) throw clientError;
        
        // Fetch services
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('id, nome, tipo')
          .order('nome');
          
        if (serviceError) throw serviceError;
        
        // Fetch vehicles (clients with vehicle data)
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('clients')
          .select('id, nome, placa, marca, modelo')
          .not('placa', 'is', null);
          
        if (vehicleError) throw vehicleError;
        
        // Transform vehicle data
        const transformedVehicles = vehicleData ? vehicleData.map(client => ({
          id: client.id,
          cliente_nome: client.nome,
          placa: client.placa || 'N/A',
          marca: client.marca || 'N/A',
          modelo: client.modelo || 'N/A',
        })) : [];
        
        setClients(clientData || []);
        setServices(serviceData || []);
        setVehicles(transformedVehicles);
        setFilteredVehicles(transformedVehicles);
        
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados necessários.",
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Filter vehicles when client changes
  useEffect(() => {
    if (selectedClientId) {
      const filtered = vehicles.filter(vehicle => vehicle.id === selectedClientId);
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [selectedClientId, vehicles]);
  
  // Handle form submission
  const onSubmit = async (data: ScheduleForm) => {
    setIsLoading(true);
    
    try {
      // First, check if we have the agendamentos table
      const { error: checkError } = await supabase
        .from('agendamentos')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      // If the table doesn't exist, create it
      if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
        // Table doesn't exist, so we'll create it first
        const { error: createTableError } = await supabase.rpc('create_agendamentos_table');
        
        if (createTableError) {
          // If RPC fails, we can still try direct SQL (usually not available in client-side)
          console.error('Failed to create table via RPC:', createTableError);
          throw new Error('Não foi possível criar a tabela de agendamentos');
        }
      }
      
      // Prepare data for insertion
      const scheduleData = {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        data_agendamento: format(data.data, 'yyyy-MM-dd'),
        horario: data.horario,
        cliente_id: data.cliente_id,
        veiculo_id: data.veiculo_id,
        servico_id: data.servico_id,
        observacoes: data.observacoes || '',
        status: 'agendado',
        created_at: new Date().toISOString(),
      };
      
      // Insert the schedule
      const { error: insertError } = await supabase
        .from('agendamentos')
        .insert([scheduleData]);
      
      if (insertError) throw insertError;
      
      toast({
        title: "Agendamento realizado",
        description: `Agendamento para ${format(data.data, 'dd/MM/yyyy')} às ${data.horario} criado com sucesso!`,
      });
      
      // Reset form
      form.reset();
      
      // Navigate back to schedules list
      navigate('/agendamentos');
      
    } catch (error: any) {
      console.error('Error creating schedule:', error.message);
      toast({
        variant: "destructive",
        title: "Erro ao criar agendamento",
        description: error.message || "Ocorreu um erro ao tentar criar o agendamento.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loadingData) {
    return <Loading text="Carregando dados para agendamento..." />;
  }
  
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Novo Agendamento</h1>
        <Button variant="outline" onClick={() => navigate('/agendamentos')}>
          Voltar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Agendar Serviço</CardTitle>
          <CardDescription>
            Preencha os dados para agendar um novo serviço
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="horario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Cliente e Veículo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cliente_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="veiculo_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veículo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={filteredVehicles.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              selectedClientId && filteredVehicles.length === 0
                                ? "Cliente sem veículos cadastrados"
                                : "Selecione um veículo"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredVehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.marca} {vehicle.modelo} - {vehicle.placa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Tipo de Serviço */}
              <FormField
                control={form.control}
                name="servico_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Serviço</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Observações */}
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione detalhes ou instruções específicas..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulingPage;
