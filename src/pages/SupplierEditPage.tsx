import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Supplier {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

const SupplierEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [supplier, setSupplier] = useState<Supplier>({
    id: '',
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  useEffect(() => {
    if (id && id !== 'novo') {
      fetchSupplier();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const fetchSupplier = async () => {
    if (!id || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setSupplier(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar fornecedor",
        description: error.message,
      });
      navigate('/dashboard/fornecedores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!supplier.nome.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "O nome do fornecedor é obrigatório.",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (id === 'novo') {
        const { error } = await supabase
          .from('fornecedores')
          .insert({
            ...supplier,
            user_id: user?.id
          });

        if (error) throw error;

        toast({
          title: "Fornecedor criado",
          description: "O fornecedor foi criado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('fornecedores')
          .update(supplier)
          .eq('id', id)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: "Fornecedor atualizado",
          description: "O fornecedor foi atualizado com sucesso.",
        });
      }

      navigate('/dashboard/fornecedores');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar fornecedor",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard/fornecedores')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          {id === 'novo' ? 'Novo Fornecedor' : 'Editar Fornecedor'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Fornecedor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Fornecedor *</Label>
              <Input
                id="nome"
                value={supplier.nome}
                onChange={(e) => setSupplier({...supplier, nome: e.target.value})}
                placeholder="Nome do fornecedor"
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={supplier.cnpj || ''}
                onChange={(e) => setSupplier({...supplier, cnpj: e.target.value})}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={supplier.telefone || ''}
                onChange={(e) => setSupplier({...supplier, telefone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={supplier.email || ''}
                onChange={(e) => setSupplier({...supplier, email: e.target.value})}
                placeholder="email@fornecedor.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={supplier.endereco || ''}
              onChange={(e) => setSupplier({...supplier, endereco: e.target.value})}
              placeholder="Rua, número, bairro"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={supplier.cidade || ''}
                onChange={(e) => setSupplier({...supplier, cidade: e.target.value})}
                placeholder="Cidade"
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={supplier.estado || ''}
                onChange={(e) => setSupplier({...supplier, estado: e.target.value})}
                placeholder="UF"
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={supplier.cep || ''}
                onChange={(e) => setSupplier({...supplier, cep: e.target.value})}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard/fornecedores')}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierEditPage;
