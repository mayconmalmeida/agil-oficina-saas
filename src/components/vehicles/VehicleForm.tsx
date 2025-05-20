
import React, { useEffect, useState } from 'react';
import { useVehicleForm } from '@/hooks/useVehicleForm';
import { Car, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import VehicleBasicInfoFields from './form-sections/VehicleBasicInfoFields';
import VehicleDetailsFields from './form-sections/VehicleDetailsFields';
import ClientSelector from './form-sections/ClientSelector';

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
  const {
    form,
    isLoading,
    onSubmit,
  } = useVehicleForm({
    onSave: onSaved,
    vehicleId,
    isEditing,
    defaultClientId: clientId
  });
  
  // Determine if we should show client selector
  // Only show if not editing or no clientId provided
  const showClientSelector = !isEditing || !clientId;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Cliente associado - only show if not editing or no clientId provided */}
        {showClientSelector && (
          <ClientSelector form={form} />
        )}
        
        <VehicleBasicInfoFields form={form} />
        
        <VehicleDetailsFields form={form} />
        
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
