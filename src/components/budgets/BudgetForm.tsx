import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatUtils';

const budgetSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  veiculo: z.string().min(1, 'Veículo é obrigatório'),
  descricao: z.string().min(1, 'Descrição do serviço é obrigatória'),
  data_validade: z.string().optional(),
  itens: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      tipo: z.enum(['produto', 'servico']),
      quantidade: z.number().min(1),
      valor_unitario: z.number().min(0),
      valor_total: z.number().min(0),
    })
  ).optional(),
  valor_total: z.string().min(1, 'Valor total é obrigatório'),
  observacoes: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

const BudgetForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [clients, setClients] = useState([
    { id: '1', nome: 'João Silva', telefone: '(11) 98765-4321', veiculo: 'Honda Civic 2020' },
    { id: '2', nome: 'Maria Oliveira', telefone: '(11) 91234-5678', veiculo: 'Toyota Corolla 2019' },
    { id: '3', nome: 'Pedro Santos', telefone: '(11) 99876-5432', veiculo: 'Volkswagen Gol 2021' },
  ]);
  const [products, setProducts] = useState([
    { id: '1', nome: 'Óleo 5W30 Sintético', tipo: 'produto', valor: 49.9 },
    { id: '2', nome: 'Filtro de Óleo', tipo: 'produto', valor: 25.5 },
    { id: '3', nome: 'Troca de Óleo', tipo: 'servico', valor: 50.0 },
    { id: '4', nome: 'Alinhamento', tipo: 'servico', valor: 80.0 },
  ]);
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      cliente: '',
      veiculo: '',
      descricao: '',
      data_validade: '',
      itens: [],
      valor_total: '0',
      observacoes: '',
    },
  });
  
  const handleSubmit = async (values: BudgetFormValues) => {
    setIsLoading(true);
    
    try {
      // Include selected items in the submission
      const formValues = {
        ...values,
        itens: selectedItems || []
      };
      
      console.log('Budget values:', formValues);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectClient = (client: any) => {
    form.setValue('cliente', client.nome);
    form.setValue('veiculo', client.veiculo);
    setClientSearchOpen(false);
  };
  
  const handleAddItem = (product: any) => {
    const newItem = {
      id: product.id,
      nome: product.nome,
      tipo: product.tipo,
      quantidade: 1,
      valor_unitario: product.valor,
      valor_total: product.valor,
    };
    
    const updatedItems = [...(selectedItems || []), newItem];
    setSelectedItems(updatedItems);
    setProductSearchOpen(false);
    
    // Update total value
    updateTotalValue(updatedItems);
  };
  
  const handleRemoveItem = (itemId: string) => {
    const updatedItems = (selectedItems || []).filter(item => item.id !== itemId);
    setSelectedItems(updatedItems);
    
    // Update total value
    updateTotalValue(updatedItems);
  };
  
  const updateTotalValue = (items: any[]) => {
    // Ensure items is always an array
    const safeItems = Array.isArray(items) ? items : [];
    
    if (safeItems.length === 0) {
      form.setValue('valor_total', '0');
      return;
    }
    
    const total = safeItems.reduce((sum, item) => {
      const itemTotal = item?.valor_total || 0;
      return sum + itemTotal;
    }, 0);
    
    form.setValue('valor_total', total.toFixed(2));
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
    
    setSelectedItems(updatedItems);
    updateTotalValue(updatedItems);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="cliente"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Cliente</FormLabel>
                <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          {...field} 
                          placeholder="Buscar cliente..." 
                          className="pr-10"
                          onClick={() => setClientSearchOpen(true)}
                        />
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
                    <Command>
                      <CommandInput placeholder="Digite o nome do cliente..." />
                      <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-48">
                          {clients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.nome}
                              onSelect={() => handleSelectClient(client)}
                              className="cursor-pointer"
                            >
                              <div>
                                <div className="font-medium">{client.nome}</div>
                                <div className="text-xs text-muted-foreground">{client.telefone}</div>
                              </div>
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
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
                  <Input placeholder="Marca, modelo e ano" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Serviço</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Revisão completa com troca de óleo e filtros" 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="border border-gray-200 rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Produtos e Serviços</h3>
            <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Adicionar Item
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-72">
                <Command>
                  <CommandInput placeholder="Buscar produto ou serviço..." />
                  <CommandEmpty>Nenhum item encontrado</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-48">
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.nome}
                          onSelect={() => handleAddItem(product)}
                          className="cursor-pointer"
                        >
                          <div>
                            <div className="font-medium">{product.nome}</div>
                            <div className="text-xs text-muted-foreground flex items-center justify-between">
                              <span className="capitalize">{product.tipo}</span>
                              <span>{formatCurrency(product.valor)}</span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
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
                    <TableHead className="text-right">Valor</TableHead>
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
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="w-12 h-8 text-center p-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valor_total)}</TableCell>
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-md">
              <p className="text-sm text-gray-500 mb-1">Nenhum item adicionado</p>
              <p className="text-xs text-gray-400">Clique em "Adicionar Item" para incluir produtos ou serviços</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="data_validade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Validade (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="valor_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Total (R$)</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-gray-50 font-medium text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre o orçamento" 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            type="submit" 
            className="flex-1 bg-oficina hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Salvando Orçamento...
              </>
            ) : (
              'Salvar Orçamento'
            )}
          </Button>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Mais ações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="print">Imprimir Orçamento</SelectItem>
              <SelectItem value="email">Enviar por E-mail</SelectItem>
              <SelectItem value="whatsapp">Enviar via WhatsApp</SelectItem>
              <SelectItem value="convert">Converter em OS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </Form>
  );
};

export default BudgetForm;
