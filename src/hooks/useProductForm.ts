import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Define the product schema
export const productSchema = z.object({
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

// Define the type for form values
export type ProductFormValues = z.infer<typeof productSchema>;

export const useProductForm = () => {
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
  
  return {
    form,
    isLoading,
    productType,
    controlStock,
    handleSubmit,
  };
};
