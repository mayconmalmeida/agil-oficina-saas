
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormSection from './FormSection';
import { UseFormReturn } from 'react-hook-form';
import { WorkshopRegistrationFormValues } from './workshopRegistrationSchema';

interface DocumentSectionProps {
  form: UseFormReturn<WorkshopRegistrationFormValues>;
  documentType: 'CPF' | 'CNPJ';
  isLoading: boolean;
  formatDocument: (value: string, type: 'CPF' | 'CNPJ') => string;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ form, documentType, isLoading, formatDocument }) => {
  return (
    <FormSection title="Dados Fiscais">
      <FormField
        control={form.control}
        name="documentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de documento</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de documento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="documentNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{documentType === 'CPF' ? 'CPF' : 'CNPJ'}</FormLabel>
            <FormControl>
              <Input
                placeholder={documentType === 'CPF' ? '123.456.789-01' : '12.345.678/0001-90'}
                {...field}
                onChange={(e) => {
                  const formatted = formatDocument(e.target.value, documentType as 'CPF' | 'CNPJ');
                  field.onChange(formatted);
                }}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>{documentType === 'CPF' ? 'Nome completo' : 'Razão social'}</FormLabel>
            <FormControl>
              <Input
                placeholder={documentType === 'CPF' ? 'João da Silva' : 'Auto Center Ltda'}
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="tradingName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome fantasia (opcional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Auto Center São Paulo"
                {...field}
                value={field.value || ''}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="stateRegistration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Inscrição Estadual</FormLabel>
            <FormControl>
              <Input
                placeholder="1234567890 ou ISENTO"
                {...field}
                value={field.value || ''}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
};

export default DocumentSection;
