
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';

interface ClientTypeSelectorProps {
  form: UseFormReturn<any>;
}

const ClientTypeSelector: React.FC<ClientTypeSelectorProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="tipo"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Tipo de Cliente</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-row space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pf" id="pf" />
                <Label htmlFor="pf">Pessoa Física</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pj" id="pj" />
                <Label htmlFor="pj">Pessoa Jurídica</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ClientTypeSelector;
