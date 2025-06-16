
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { productSchema, ProductFormValues } from '@/schemas/productSchema';
import { fetchProduct, saveProduct } from '@/services/productService';
import { mapServiceToFormValues, defaultProductValues } from '@/utils/formUtils';

export { productSchema, type ProductFormValues } from '@/schemas/productSchema';

// Generate automatic product code
const generateProductCode = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `PROD-${timestamp}${random}`;
};

export const useProductForm = (productId?: string, onSaveSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...defaultProductValues,
      codigo: generateProductCode() // Auto-generate code for new products
    },
  });
  
  // Fetch product data if editing an existing product
  useEffect(() => {
    const getProductData = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      try {
        const data = await fetchProduct(productId);
        
        if (data) {
          setIsEditing(true);
          // Format the data to match the form fields
          form.reset(mapServiceToFormValues(data));
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
    
    getProductData();
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
      
      const result = await saveProduct(values, isEditing ? productId : undefined, user.id);
      
      toast({
        title: isEditing ? 'Produto atualizado' : 'Produto adicionado',
        description: `${values.nome} foi ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`,
      });
      
      if (!isEditing) {
        // Reset the form for new products with new auto-generated code
        form.reset({
          ...defaultProductValues,
          codigo: generateProductCode()
        });
      }
      
      // Call the onSaveSuccess callback if provided
      if (onSaveSuccess) {
        onSaveSuccess();
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
