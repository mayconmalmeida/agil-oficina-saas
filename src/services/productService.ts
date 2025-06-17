
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
    preco_custo: parseFloat(values.preco_custo.replace(/[^\d,]/g, '').replace(',', '.')),
    preco_venda: parseFloat(values.preco_venda.replace(/[^\d,]/g, '').replace(',', '.')),
    quantidade_estoque: parseInt(values.quantidade) || 0,
    estoque_minimo: values.estoque_minimo ? parseInt(values.estoque_minimo) : null,
    descricao: values.descricao || null,
    fornecedor: values.fornecedor || null,
    controlar_estoque: values.controlar_estoque,
  };
  
  if (productId) {
    // Update existing product - preserve codigo if it exists
    const updateData: any = {
      nome: productData.nome,
      tipo: productData.tipo,
      valor: productData.preco_venda,
      descricao: productData.descricao,
      preco_custo: productData.preco_custo,
      fornecedor: productData.fornecedor,
    };

    // Only update quantidade_estoque if controlar_estoque is enabled
    if (productData.controlar_estoque) {
      updateData.quantidade_estoque = productData.quantidade_estoque;
      updateData.estoque_minimo = productData.estoque_minimo;
    }

    // Only update codigo if it's not already set (preserve XML imported codes)
    const { data: existingProduct } = await supabase
      .from('services')
      .select('codigo')
      .eq('id', productId)
      .single();

    if (!existingProduct?.codigo && productData.codigo) {
      updateData.codigo = productData.codigo;
    }
    
    const { error } = await supabase
      .from('services')
      .update(updateData)
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
        codigo: productData.codigo,
        tipo: productData.tipo,
        valor: productData.preco_venda,
        preco_custo: productData.preco_custo,
        descricao: productData.descricao,
        fornecedor: productData.fornecedor,
        quantidade_estoque: productData.controlar_estoque ? productData.quantidade_estoque : 0,
        user_id: userId,
      });
    
    if (error) {
      throw error;
    }
    
    return { isNew: true };
  }
}
