import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import EditCategoryDialog from '@/components/categories/EditCategoryDialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const { toast } = useToast();

  const defaultCategories = [
    'Manutenção Preventiva',
    'Manutenção Corretiva',
    'Troca de Óleo',
    'Filtros (Ar, Combustível, Óleo)',
    'Sistema de Freios',
    'Suspensão e Amortecedores',
    'Pneus e Rodas',
    'Bateria e Sistema Elétrico',
    'Ar Condicionado',
    'Motor e Transmissão',
    'Embreagem',
    'Sistema de Escape',
    'Radiador e Arrefecimento',
    'Faróis e Lanternas',
    'Limpador de Para-brisa',
    'Injeção Eletrônica',
    'Alinhamento e Balanceamento',
    'Vidros e Para-brisas',
    'Estofados e Tapeçaria',
    'Pintura e Funilaria',
    'Diagnóstico Automotivo',
    'Instalação de Acessórios'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const createDefaultCategories = async () => {
    setIsCreatingDefaults(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const categoriesToInsert = defaultCategories.map(name => ({
        name,
        user_id: user.id
      }));

      const { error } = await supabase
        .from('categories')
        .insert(categoriesToInsert);

      if (error) throw error;

      toast({
        title: "Categorias criadas",
        description: `${defaultCategories.length} categorias padrão foram adicionadas com sucesso.`,
      });

      fetchCategories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar categorias",
        description: error.message,
      });
    } finally {
      setIsCreatingDefaults(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome da categoria é obrigatório.",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('categories')
        .insert({ name: newCategory.trim(), user_id: user.id });

      if (error) throw error;

      toast({
        title: "Categoria adicionada",
        description: `${newCategory} foi adicionada com sucesso.`,
      });

      setNewCategory('');
      fetchCategories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar categoria",
        description: error.message,
      });
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Categoria removida",
        description: `${name} foi removida com sucesso.`,
      });

      fetchCategories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover categoria",
        description: error.message,
      });
    }
  };

  const checkCategoryUsage = async (categoryId: string): Promise<boolean> => {
    try {
      // Verificar se a categoria está sendo usada em serviços
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .eq('tipo', categories.find(c => c.id === categoryId)?.name)
        .limit(1);

      if (servicesError) throw servicesError;

      // Se encontrou serviços usando esta categoria, não pode deletar
      return services && services.length > 0;
    } catch (error) {
      console.error('Erro ao verificar uso da categoria:', error);
      return true; // Em caso de erro, assumir que está sendo usada (segurança)
    }
  };

  const handleDeleteClick = async (category: Category) => {
    setIsCheckingUsage(true);
    try {
      const isInUse = await checkCategoryUsage(category.id);
      
      if (isInUse) {
        toast({
          variant: "destructive",
          title: "Categoria em uso",
          description: "Esta categoria não pode ser excluída pois está sendo usada em serviços.",
        });
        return;
      }
      
      setDeletingCategory(category);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao verificar uso da categoria.",
      });
    } finally {
      setIsCheckingUsage(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deletingCategory.id);

      if (error) throw error;

      toast({
        title: "Categoria removida",
        description: `${deletingCategory.name} foi removida com sucesso.`,
      });

      fetchCategories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover categoria",
        description: error.message,
      });
    } finally {
      setDeletingCategory(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categorias de Serviços</h1>
        {categories.length === 0 && (
          <Button 
            onClick={createDefaultCategories} 
            disabled={isCreatingDefaults}
            className="bg-oficina hover:bg-blue-700"
          >
            {isCreatingDefaults ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Categorias Padrão'
            )}
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Adicionar Nova Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nome da categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <Button onClick={addCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhuma categoria cadastrada.</p>
              <p className="text-sm text-gray-400">
                Clique em "Criar Categorias Padrão" para começar com categorias pré-definidas.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(category)}
                          disabled={isCheckingUsage}
                        >
                          {isCheckingUsage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditCategoryDialog
        category={editingCategory}
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSuccess={fetchCategories}
      />

      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir a categoria "${deletingCategory?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
};

export default CategoriesPage;
