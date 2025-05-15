
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface ClientSearchFormProps {
  onFilterChange: (filters: any) => void;
}

const ClientSearchForm: React.FC<ClientSearchFormProps> = ({ onFilterChange }) => {
  const form = useForm({
    defaultValues: {
      searchTerm: '',
      nome: '',
      documento: '',
      telefone: '',
      veiculo: '',
      placa: '',
    }
  });
  
  const { reset } = form;
  
  const handleFormSubmit = (values: any) => {
    // Filtrar campos vazios
    const filters = Object.entries(values).reduce((acc: any, [key, value]) => {
      if (value && String(value).trim() !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    onFilterChange(filters);
  };
  
  const handleClearFilters = () => {
    reset({
      searchTerm: '',
      nome: '',
      documento: '',
      telefone: '',
      veiculo: '',
      placa: '',
    });
    onFilterChange({});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="border-b pb-4">
          <FormField
            control={form.control}
            name="searchTerm"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Buscar por nome, veículo, telefone ou documento..."
                      {...field}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do cliente" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="documento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="CPF ou CNPJ" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="veiculo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veículo</FormLabel>
                <FormControl>
                  <Input placeholder="Marca ou modelo" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="placa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa</FormLabel>
                <FormControl>
                  <Input placeholder="ABC1234" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientSearchForm;
