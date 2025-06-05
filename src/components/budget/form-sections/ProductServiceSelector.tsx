
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatUtils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface ServiceProduct {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  valor: number;
}

interface SelectedItem {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

interface ProductServiceSelectorProps {
  selectedItems: SelectedItem[];
  onItemsChange: (items: SelectedItem[]) => void;
}

const ProductServiceSelector: React.FC<ProductServiceSelectorProps> = ({ selectedItems, onItemsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [services, setServices] = useState<ServiceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('nome');
          
        if (error) {
          console.error('Error fetching services:', error);
          return;
        }
        
        const formattedServices = (data || []).map(service => ({
          id: service.id,
          nome: service.nome,
          tipo: service.tipo as 'produto' | 'servico',
          valor: Number(service.valor) || 0
        }));
        
        setServices(formattedServices);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, [user?.id]);

  const handleAddItem = (service: ServiceProduct) => {
    // Check if item is already selected
    const existingItem = selectedItems.find(item => item.id === service.id);
    if (existingItem) {
      // If already exists, increase quantity
      handleQuantityChange(service.id, existingItem.quantidade + 1);
    } else {
      // Add new item
      const newItem: SelectedItem = {
        id: service.id,
        nome: service.nome,
        tipo: service.tipo,
        quantidade: 1,
        valor_unitario: service.valor,
        valor_total: service.valor,
      };
      
      const updatedItems = [...(selectedItems || []), newItem];
      onItemsChange(updatedItems);
    }
    setIsOpen(false);
  };
  
  const handleRemoveItem = (itemId: string) => {
    const updatedItems = (selectedItems || []).filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
  };
  
  const handleQuantityChange = (itemId: string, newValue: number) => {
    if (newValue < 1) return;
    
    const safeItems = Array.isArray(selectedItems) ? selectedItems : [];
    const updatedItems = safeItems.map(item => {
      if (item.id === itemId) {
        const valor_total = item.valor_unitario * newValue;
        return { ...item, quantidade: newValue, valor_total };
      }
      return item;
    });
    
    onItemsChange(updatedItems);
  };

  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Produtos e Serviços</h3>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Adicionar Item
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-80">
            <Command>
              <CommandInput placeholder="Buscar produto ou serviço..." />
              <CommandList>
                <CommandEmpty>
                  {isLoading ? "Carregando..." : "Nenhum item encontrado"}
                </CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-48">
                    {services.map((service) => (
                      <CommandItem
                        key={service.id}
                        value={service.nome}
                        onSelect={() => handleAddItem(service)}
                        className="cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{service.nome}</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-between">
                            <span className="capitalize">{service.tipo}</span>
                            <span>{formatCurrency(service.valor)}</span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {Array.isArray(selectedItems) && selectedItems.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Qtd.</TableHead>
                <TableHead className="text-right">Valor Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="capitalize">{item.tipo}</TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-center p-1"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.valor_unitario)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.valor_total)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="bg-gray-50 px-4 py-2 border-t">
            <div className="flex justify-between items-center font-semibold">
              <span>Total Geral:</span>
              <span className="text-lg">
                {formatCurrency(selectedItems.reduce((sum, item) => sum + item.valor_total, 0))}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-md">
          <p className="text-sm text-gray-500 mb-1">Nenhum item adicionado</p>
          <p className="text-xs text-gray-400">Clique em "Adicionar Item" para incluir produtos ou serviços</p>
        </div>
      )}
    </div>
  );
};

export default ProductServiceSelector;
