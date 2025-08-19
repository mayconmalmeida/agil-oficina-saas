
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Colaborador } from '@/types/colaboradores';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ColaboradoresPage: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    funcao: 'colaborador' as Colaborador['funcao']
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios_colaboradores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setColaboradores(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar colaboradores",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar oficina_id do usuário
      const { data: oficina } = await supabase
        .from('oficinas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!oficina) throw new Error('Oficina não encontrada');

      const colaboradorData = {
        ...formData,
        oficina_id: oficina.id,
        user_id: user.id
      };

      if (editingColaborador) {
        const { error } = await supabase
          .from('usuarios_colaboradores')
          .update(colaboradorData)
          .eq('id', editingColaborador.id);

        if (error) throw error;
        toast({ title: "Colaborador atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('usuarios_colaboradores')
          .insert([colaboradorData]);

        if (error) throw error;
        toast({ title: "Colaborador criado com sucesso!" });
      }

      fetchColaboradores();
      resetForm();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar colaborador",
        description: error.message
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return;

    try {
      const { error } = await supabase
        .from('usuarios_colaboradores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Colaborador excluído com sucesso!" });
      fetchColaboradores();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir colaborador",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      funcao: 'colaborador'
    });
    setEditingColaborador(null);
  };

  const openEditDialog = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email,
      telefone: colaborador.telefone || '',
      funcao: colaborador.funcao
    });
    setDialogOpen(true);
  };

  const getFuncaoBadgeColor = (funcao: string) => {
    switch (funcao) {
      case 'administrador': return 'bg-red-100 text-red-800';
      case 'financeiro': return 'bg-green-100 text-green-800';
      case 'mecanico': return 'bg-blue-100 text-blue-800';
      case 'recepcionista': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Colaboradores</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="funcao">Função</Label>
                <Select 
                  value={formData.funcao} 
                  onValueChange={(value: Colaborador['funcao']) => setFormData({...formData, funcao: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="recepcionista">Recepcionista</SelectItem>
                    <SelectItem value="mecanico">Mecânico</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingColaborador ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradores.map((colaborador) => (
                <TableRow key={colaborador.id}>
                  <TableCell>{colaborador.nome}</TableCell>
                  <TableCell>{colaborador.email}</TableCell>
                  <TableCell>{colaborador.telefone || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getFuncaoBadgeColor(colaborador.funcao)}>
                      {colaborador.funcao}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={colaborador.ativo ? 'default' : 'secondary'}>
                      {colaborador.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditDialog(colaborador)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(colaborador.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColaboradoresPage;
