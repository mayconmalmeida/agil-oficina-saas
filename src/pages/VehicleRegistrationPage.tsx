import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Car, User } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import Loading from '@/components/ui/loading';

// Define the form schema
const vehicleSchema = z.object({
  placa: z.string().min(1, 'Placa é obrigatória'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano: z.string().min(1, 'Ano é obrigatório'),
  cliente_id: z.string().min(1, 'Cliente é obrigatório')
});

type VehicleForm = z.infer<typeof vehicleSchema>;

// Client type
interface Client {
  id: string;
  nome: string;
}

const VehicleRegistrationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      placa: '',
      marca: '',
      modelo: '',
      ano: '',
      cliente_id: ''
    }
  });
  
  // Fetch clients for dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, nome')
          .order('nome');
          
        if (error) throw error;
        
        setClients(data || []);
      } catch (error: any) {
        console.error('Error fetching clients:', error.message);
        toast({
          variant: "destructive",
          title: "Erro ao carregar clientes",
          description: "Não foi possível carregar a lista de clientes.",
        });
      } finally {
        setLoadingClients(false);
      }
    };
    
    fetchClients();
  }, [toast]);
  
  // Handle form submission
  const onSubmit = async (data: VehicleForm) => {
    setIsLoading(true);
    
    try {
      // First, find the client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, nome')
        .eq('id', data.cliente_id)
        .single();
        
      if (clientError) throw clientError;
      
      // For now, store the vehicle information as an update to the client
      const { error } = await supabase
        .from('clients')
        .update({
          placa: data.placa,
          marca: data.marca,
          modelo: data.modelo,
          ano: data.ano
        })
        .eq('id', data.cliente_id);
        
      if (error) throw error;
      
      toast({
        title: "Veículo cadastrado",
        description: `Veículo de ${clientData.nome} cadastrado com sucesso!`,
      });
      
      // Reset form
      form.reset();
      
      // Navigate back to vehicles list
      navigate('/veiculos');
      
    } catch (error: any) {
      console.error('Error saving vehicle:', error.message);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar veículo",
        description: error.message || "Ocorreu um erro ao tentar cadastrar o veículo.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loadingClients) {
    return <Loading text="Carregando clientes..." />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cadastrar Novo Veículo</h1>
        <Button variant="outline" onClick={() => navigate('/veiculos')}>
          Voltar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Veículo</CardTitle>
          <CardDescription>
            Preencha os dados do veículo a ser cadastrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Cliente associado */}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Placa */}
                <FormField
                  control={form.control}
                  name="placa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Ano */}
                <FormField
                  control={form.control}
                  name="ano"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormControl>
                        <Input placeholder="2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Marca */}
                <FormField
                  control={form.control}
                  name="marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ford" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Modelo */}
                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Focus" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Car className="mr-2 h-4 w-4" />
                    Cadastrar Veículo
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

export default VehicleRegistrationPage;
