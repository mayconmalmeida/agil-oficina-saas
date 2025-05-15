import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  nome: z.string().min(1, 'Nome do produto é obrigatório'),
  codigo: z.string().optional(),
  tipo: z.enum(['produto', 'servico']),
  preco_custo: z.string().min(1, 'Preço de custo é obrigatório'),
  preco_venda: z.string().min(1, 'Preço de venda é obrigatório'),
  quantidade: z.string().min(1, 'Quantidade é obrigatória'),
  estoque_minimo: z.string().optional(),
  descricao: z.string().optional(),
  fornecedor: z.string().optional(),
  controlar_estoque: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      tipo: 'produto',
      preco_custo: '',
      preco_venda: '',
      quantidade: '0',
      estoque_minimo: '5',
      descricao: '',
      fornecedor: '',
      controlar_estoque: true,
    },
  });
  
  const handleSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    
    try {
      console.log('Submitting product values:', values);
      
      // Convert string values to proper types for database
      const productData = {
        nome: values.nome,
        codigo: values.codigo || null,
        tipo: values.tipo,
        preco_custo: parseFloat(values.preco_custo.replace(',', '.')),
        preco_venda: parseFloat(values.preco_venda.replace(',', '.')),
        quantidade: parseInt(values.quantidade),
        estoque_minimo: values.estoque_minimo ? parseInt(values.estoque_minimo) : null,
        descricao: values.descricao || null,
        fornecedor: values.fornecedor || null,
        controlar_estoque: values.controlar_estoque,
      };
      
      // Insert into the products table
      const { data, error } = await supabase
        .from('services') // We're using the services table for now
        .insert({
          nome: productData.nome,
          tipo: productData.tipo,
          valor: productData.preco_venda, // Map to existing column
          descricao: productData.descricao,
          // Other fields will be handled when we create a proper products table
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Produto adicionado',
        description: `${values.nome} foi adicionado com sucesso!`,
      });
      
      // Reset the form
      form.reset();
      
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar produto",
        description: error.message || "Não foi possível salvar o produto. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const productType = form.watch('tipo');
  const controlStock = form.watch('controlar_estoque');
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto/Serviço</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Óleo 5W30 Sintético 1L" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código/Referência (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: OL-5W30-1L" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="produto">Produto/Peça</SelectItem>
                  <SelectItem value="servico">Serviço</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="preco_custo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Custo (R$)</FormLabel>
                <FormControl>
                  <Input placeholder="29,90" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="preco_venda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Venda (R$)</FormLabel>
                <FormControl>
                  <Input placeholder="49,90" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {productType === 'produto' && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Controle de Estoque</h3>
              <FormField
                control={form.control}
                name="controlar_estoque"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormLabel className="text-sm">Controlar estoque</FormLabel>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {controlStock && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="quantidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade em Estoque</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estoque_minimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Mínimo</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        )}
        
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Adicione detalhes sobre o produto ou serviço"
                  className="min-h-20" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fornecedor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fornecedor (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Nome do fornecedor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Salvando...
            </>
          ) : (
            'Adicionar Produto/Serviço'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;
