
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Car, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateLicensePlate } from '@/utils/validationUtils';
import { formatLicensePlate } from '@/utils/formatUtils';

// Define schema with validations
const vehicleSchema = z.object({
  placa: z.string()
    .refine(val => validateLicensePlate(val), {
      message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
    }),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano: z.string().regex(/^\d{4}$/, 'Ano deve ter exatamente 4 dígitos'),
  cor: z.string().optional().or(z.literal('')),
  kilometragem: z.string().optional().or(z.literal('')),
  cliente_id: z.string().min(1, 'Cliente é obrigatório')
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface Client {
  id: string;
  nome: string;
}

interface VehicleFormProps {
  onSaved: () => void;
  vehicleId?: string;
  isEditing?: boolean;
  clientId?: string;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ 
  onSaved,
  vehicleId,
  isEditing = false,
  clientId
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = React.useState(true);
  const { toast } = useToast();
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      placa: '',
      marca: '',
      modelo: '',
      ano: '',
      cor: '',
      kilometragem: '',
      cliente_id: clientId || ''
    }
  });
  
  // Fetch vehicle data if editing
  React.useEffect(() => {
    if (isEditing && vehicleId) {
      const fetchVehicle = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', vehicleId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            form.reset({
              placa: data.placa || '',
              marca: data.marca || '',
              modelo: data.modelo || '',
              ano: data.ano || '',
              cor: data.cor || '',
              kilometragem: data.kilometragem || '',
              cliente_id: data.id
            });
          }
        } catch (error: any) {
          console.error('Error fetching vehicle:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar veículo",
            description: error.message || "Não foi possível carregar os dados do veículo."
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchVehicle();
    }
  }, [isEditing, vehicleId, form, toast]);
  
  // Fetch clients for dropdown
  React.useEffect(() => {
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
  
  // Format license plate
  const placa = form.watch('placa');
  
  React.useEffect(() => {
    if (placa) {
      const formattedPlate = formatLicensePlate(placa);
      if (formattedPlate !== placa) {
        form.setValue('placa', formattedPlate);
      }
    }
  }, [placa, form]);
  
  const onSubmit = async (values: VehicleFormValues) => {
    setIsLoading(true);
    
    try {
      // Update the client record with vehicle information
      if (isEditing) {
        const { error } = await supabase
          .from('clients')
          .update({
            placa: values.placa,
            marca: values.marca,
            modelo: values.modelo,
            ano: values.ano,
            cor: values.cor || null,
            kilometragem: values.kilometragem || null,
            veiculo: `${values.marca} ${values.modelo} ${values.ano}, Placa: ${values.placa}`
          })
          .eq('id', vehicleId);
          
        if (error) throw error;
      } else {
        // For new vehicles, we update the client record
        const { error } = await supabase
          .from('clients')
          .update({
            placa: values.placa,
            marca: values.marca,
            modelo: values.modelo,
            ano: values.ano,
            cor: values.cor || null,
            kilometragem: values.kilometragem || null,
            veiculo: `${values.marca} ${values.modelo} ${values.ano}, Placa: ${values.placa}`
          })
          .eq('id', values.cliente_id);
          
        if (error) throw error;
      }
      
      toast({
        title: isEditing ? "Veículo atualizado" : "Veículo cadastrado",
        description: isEditing 
          ? "Veículo atualizado com sucesso!"
          : "Veículo cadastrado com sucesso!",
      });
      
      // Reset form
      form.reset();
      
      // Call onSaved callback
      onSaved();
      
    } catch (error: any) {
      console.error('Error saving vehicle:', error.message);
      toast({
        variant: "destructive",
        title: isEditing ? "Erro ao atualizar veículo" : "Erro ao cadastrar veículo",
        description: error.message || "Ocorreu um erro ao tentar salvar o veículo.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loadingClients) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-oficina" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Cliente associado - only show if not editing or no clientId provided */}
        {(!isEditing || !clientId) && (
          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Placa */}
          <FormField
            control={form.control}
            name="placa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa</FormLabel>
                <FormControl>
                  <Input placeholder="ABC-1234 ou ABC1D23" {...field} />
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
                  <Input placeholder="2023" {...field} maxLength={4} />
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cor */}
          <FormField
            control={form.control}
            name="cor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Preto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Kilometragem */}
          <FormField
            control={form.control}
            name="kilometragem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilometragem (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 45000" {...field} />
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
              {isEditing ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default VehicleForm;
