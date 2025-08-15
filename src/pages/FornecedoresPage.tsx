
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Phone, Mail, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useOficinaFilters } from '@/hooks/useOficinaFilters';
import FornecedorForm from '@/components/fornecedores/FornecedorForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  created_at: string;
}

const FornecedoresPage: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filteredFornecedores, setFilteredFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { oficina_id, isReady } = useOficinaFilters();

  useEffect(() => {
    if (isReady) {
      loadFornecedores();
    }
  }, [isReady, oficina_id]);

  useEffect(() => {
    const filtered = fornecedores.filter(fornecedor =>
      fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.cnpj?.includes(searchTerm) ||
      fornecedor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFornecedores(filtered);
  }, [searchTerm, fornecedores]);

  const loadFornecedores = async () => {
    if (!oficina_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('oficina_id', oficina_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar fornecedores",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fornecedor excluído",
        description: "Fornecedor foi excluído com sucesso.",
      });

      loadFornecedores();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir fornecedor",
        description: error.message
      });
    }
  };

  const formatCNPJ = (cnpj?: string) => {
    if (!cnpj) return 'N/A';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  if (!isReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando fornecedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {fornecedores.length} fornecedores cadastrados
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingFornecedor(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </DialogTitle>
              </DialogHeader>
              <FornecedorForm
                fornecedor={editingFornecedor}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setEditingFornecedor(null);
                  loadFornecedores();
                }}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingFornecedor(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar por nome, CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredFornecedores.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFornecedores.map((fornecedor) => (
                <Card key={fornecedor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{fornecedor.nome}</h3>
                          <p className="text-sm text-gray-600">
                            CNPJ: {formatCNPJ(fornecedor.cnpj)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingFornecedor(fornecedor);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(fornecedor.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {fornecedor.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{fornecedor.email}</span>
                        </div>
                      )}

                      {fornecedor.telefone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{fornecedor.telefone}</span>
                        </div>
                      )}

                      {(fornecedor.endereco || fornecedor.cidade) && (
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            {fornecedor.endereco && <p>{fornecedor.endereco}</p>}
                            {fornecedor.cidade && (
                              <p>{fornecedor.cidade}{fornecedor.estado && ` - ${fornecedor.estado}`}</p>
                            )}
                            {fornecedor.cep && <p>CEP: {fornecedor.cep}</p>}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          Cadastrado em: {new Date(fornecedor.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FornecedoresPage;
