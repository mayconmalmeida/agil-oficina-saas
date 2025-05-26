
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import { formatCurrency } from '@/utils/formatUtils';

interface ServiceSelectorProps {
  services: any[];
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ services }) => {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="mr-2 h-5 w-5" />
          2. Selecionar Serviço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="servico_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.nome}</span>
                        <span className="text-sm text-green-600 font-medium">
                          {formatCurrency(service.valor)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default ServiceSelector;
