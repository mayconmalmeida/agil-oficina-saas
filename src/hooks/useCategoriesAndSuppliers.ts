
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

export const useCategoriesAndSuppliers = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found');
          return;
        }
        
        // Buscar categorias do usuário
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name');
        
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }
        
        // Buscar fornecedores da tabela 'fornecedores' (não 'suppliers')
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('fornecedores')
          .select('id, nome as name')
          .eq('user_id', user.id)
          .order('nome');
        
        if (suppliersError) {
          console.error('Error fetching suppliers:', suppliersError);
        } else {
          setSuppliers(suppliersData || []);
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar categorias e fornecedores.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  return {
    categories,
    suppliers,
    isLoading,
  };
};
