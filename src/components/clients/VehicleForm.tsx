import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { validateLicensePlate } from '@/utils/validationUtils';

const vehicleSchema = z.object({
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano: z.string().regex(/^\d{4}$/, 'Ano deve ter 4 dígitos'),
  placa: z.string().refine(val => validateLicensePlate(val), {
    message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
  }),
  cor: z.string().optional(),
  kilometragem: z.string().optional(),
  tipo_combustivel: z.string().optional()
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  cor?: string;
  kilometragem?: string;
  tipo_combustivel?: string;
}

interface VehicleFormProps {
  clientId: string;
  vehicle?: Vehicle | null;
  onSave: () => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  clientId,
  vehicle,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      marca: vehicle?.marca || '',
      modelo: vehicle?.modelo || '',
      ano: vehicle?.ano || '',
      placa: vehicle?.placa || '',
      cor: vehicle?.cor || '',
      kilometragem: vehicle?.kilometragem || '',
      tipo_combustivel: vehicle?.tipo_combustivel || ''
    }
  });

  const onSubmit = async (data: VehicleFormData) => {
    if (!user?.id) return;

    try {
      if (vehicle) {
        // Editar veículo existente
        const { error } = await supabase
          .from('veiculos')
          .update({
            marca: data.marca,
            modelo: data.modelo,
            ano: data.ano,
            placa: data.placa,
            cor: data.cor || null,
            kilometragem: data.kilometragem || null,
            tipo_combustivel: data.tipo_combustivel || null
          })
          .eq('id', vehicle.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Veículo atualizado",
          description: "As informações do veículo foram atualizadas com sucesso."
        });
      } else {
        // Criar novo veículo
        const { error } = await supabase
          .from('veiculos')
          .insert({
            cliente_id: clientId,
            user_id: user.id,
            marca: data.marca,
            modelo: data.modelo,
            ano: data.ano,
            placa: data.placa,
            cor: data.cor || null,
            kilometragem: data.kilometragem || null,
            tipo_combustivel: data.tipo_combustivel || null
          });

        if (error) throw error;

        toast({
          title: "Veículo adicionado",
          description: "O novo veículo foi cadastrado com sucesso."
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar veículo:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar o veículo."
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="marca">Marca</Label>
          <Input
            id="marca"
            {...form.register('marca')}
            placeholder="Ex: Toyota"
          />
          {form.formState.errors.marca && (
            <p className="text-sm text-red-500">{form.formState.errors.marca.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="modelo">Modelo</Label>
          <Input
            id="modelo"
            {...form.register('modelo')}
            placeholder="Ex: Corolla"
          />
          {form.formState.errors.modelo && (
            <p className="text-sm text-red-500">{form.formState.errors.modelo.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ano">Ano</Label>
          <Input
            id="ano"
            {...form.register('ano')}
            placeholder="Ex: 2020"
            maxLength={4}
          />
          {form.formState.errors.ano && (
            <p className="text-sm text-red-500">{form.formState.errors.ano.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="placa">Placa</Label>
          <Input
            id="placa"
            {...form.register('placa')}
            placeholder="Ex: ABC-1234"
            style={{ textTransform: 'uppercase' }}
          />
          {form.formState.errors.placa && (
            <p className="text-sm text-red-500">{form.formState.errors.placa.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cor">Cor</Label>
          <Input
            id="cor"
            {...form.register('cor')}
            placeholder="Ex: Branco"
          />
        </div>
        
        <div>
          <Label htmlFor="tipo_combustivel">Combustível</Label>
          <Input
            id="tipo_combustivel"
            {...form.register('tipo_combustivel')}
            placeholder="Ex: Flex"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="kilometragem">Kilometragem</Label>
        <Input
          id="kilometragem"
          {...form.register('kilometragem')}
          placeholder="Ex: 50000"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;
