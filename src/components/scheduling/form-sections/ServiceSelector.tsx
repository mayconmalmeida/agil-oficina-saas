import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useOficinaFilters, getOficinaFilter } from '@/hooks/useOficinaFilters';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  nome: string;
  valor: number;
  descricao?: string;
}

interface ServiceSelectorProps {
  services: any[];
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ services: propServices }) => {
  const { control } = useFormContext();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const { oficina_id, user_id, isReady } = useOficinaFilters();
  const { toast } = useToast();

  useEffect(() => {
    if (isReady) {
      loadServices();
    }
  }, [isReady]);

  const loadServices = async () => {
    if (!isReady) return;
    
    setLoading(true);
    try {
      const filter = getOficinaFilter(oficina_id, user_id);
      if (!filter) {
        console.log('[ServiceSelector] ❌ Filtros não disponíveis');
        setLoading(false);
        return;
      }

      // Simple query without complex conditional typing
      const { data, error } = await supabase
        .from('services')
        .select('id, nome, valor, descricao')
        .eq('tipo', 'servico')
        .eq('is_active', true)
        .order('nome');

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar serviços",
        description: "Não foi possível carregar a lista de serviços.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <FormField
      control={control}
      name="servico_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Serviço</FormLabel>
          <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Carregando serviços..." : "Selecione um serviço"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {services.length === 0 ? (
                <SelectItem value="no-services" disabled>
                  {loading ? "Carregando..." : "Nenhum serviço cadastrado"}
                </SelectItem>
              ) : (
                services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{service.nome}</span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatCurrency(service.valor)}</span>
                        {service.descricao && <span>• {service.descricao}</span>}
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ServiceSelector;
