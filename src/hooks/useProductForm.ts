
import { useState, useEffect } from 'react';
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
  preco_custo: z.string().min(1, 'Preço de custo é obrigatório')
    .refine((val) => /^\d+([,.]\d{1,2})?$/.test(val), {
      message: 'Formato inválido. Use apenas números com até 2 casas decimais'
    }),
  preco_venda: z.string().min(1, 'Preço de venda é obrigatório')
    .refine((val) => /^\d+([,.]\d{1,2})?$/.test(val), {
      message: 'Formato inválido. Use apenas números com até 2 casas decimais'
    }),
  quantidade: z.string().min(1, 'Quantidade é obrigatória')
    .refine((val) => /^\d+$/.test(val), {
      message: 'Apenas números inteiros são permitidos'
    }),
  estoque_minimo: z.string().optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: 'Apenas números inteiros são permitidos'
    }),
  descricao: z.string().optional(),
  fornecedor: z.string().optional(),
  controlar_estoque: z.boolean().default(true),
});

// Define the type for form values
export type ProductFormValues = z.infer<typeof productSchema>;

export const useProductForm = (productId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
  
  // Fetch product data if editing an existing product
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setIsEditing(true);
          // Format the data to match the form fields
          form.reset({
            nome: data.nome || '',
            tipo: data.tipo || 'produto',
            preco_venda: data.valor?.toString() || '',
            preco_custo: data.valor ? (parseFloat(data.valor) * 0.7).toString() : '', // Estimate cost as 70% of selling price if not available
            quantidade: '0', // Default values for fields not in the services table
            estoque_minimo: '5',
            descricao: data.descricao || '',
            codigo: '',
            fornecedor: '',
            controlar_estoque: true,
          });
        }
      } catch (error: any) {
        console.error('Error fetching product:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar produto",
          description: error.message || "Não foi possível carregar os dados do produto.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId, form, toast]);
  
  const handleSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    
    try {
      console.log('Submitting product values:', values);
      
      // Get the user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
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
      
      if (isEditing && productId) {
        // Update existing product
        const { error } = await supabase
          .from('services')
          .update({
            nome: productData.nome,
            tipo: productData.tipo,
            valor: productData.preco_venda,
            descricao: productData.descricao,
          })
          .eq('id', productId);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Produto atualizado',
          description: `${values.nome} foi atualizado com sucesso!`,
        });
      } else {
        // Insert new product
        const { error } = await supabase
          .from('services')
          .insert({
            nome: productData.nome,
            tipo: productData.tipo,
            valor: productData.preco_venda,
            descricao: productData.descricao,
            user_id: user.id, // Add user_id to fix RLS policy error
          });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Produto adicionado',
          description: `${values.nome} foi adicionado com sucesso!`,
        });
        
        // Reset the form
        form.reset();
      }
      
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
    isEditing,
  };
};
