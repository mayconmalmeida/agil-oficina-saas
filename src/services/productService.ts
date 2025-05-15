
import { supabase } from '@/lib/supabase';
import { ProductFormValues } from '@/schemas/productSchema';

export async function fetchProduct(productId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function saveProduct(values: ProductFormValues, productId?: string, userId?: string) {
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
  
  if (productId) {
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
    
    return { productId, isNew: false };
  } else {
    // Insert new product
    const { error } = await supabase
      .from('services')
      .insert({
        nome: productData.nome,
        tipo: productData.tipo,
        valor: productData.preco_venda,
        descricao: productData.descricao,
        user_id: userId, // Add user_id to fix RLS policy error
      });
    
    if (error) {
      throw error;
    }
    
    return { isNew: true };
  }
}
