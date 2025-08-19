
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Edit, Trash2, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Collaborator {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  funcao: string;
  permissoes: string[];
  ativo: boolean;
  created_at: string;
}

const CollaboratorsPage: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({
    nome: '',
    email: '',
    telefone: '',
    funcao: 'colaborador',
    permissoes: [] as string[]
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const availableRoles = [
    { value: 'administrador', label: 'Administrador' },
    { value: 'recepcionista', label: 'Recepcionista' },
    { value: 'mecanico', label: 'Mecânico' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'colaborador', label: 'Colaborador' }
  ];

  const availablePermissions = [
    'clientes_ver',
    'clientes_criar',
    'clientes_editar',
    'clientes_excluir',
    'os_ver',
    'os_criar',
    'os_editar',
    'os_finalizar',
    'produtos_ver',
    'produtos_editar',
    'estoque_ver',
    'estoque_editar',
    'financeiro_ver',
    'financeiro_editar',
    'relatorios_ver'
  ];

  useEffect(() => {
    fetchCollaborators();
  }, [user?.id]);

  const fetchCollaborators = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('usuarios_colaboradores')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) throw error;
      
      // Transform the data to match our Collaborator interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        email: item.email,
        telefone: item.telefone,
        funcao: item.funcao,
        permissoes: Array.isArray(item.permissoes) ? item.permissoes : [],
        ativo: item.ativo,
        created_at: item.created_at
      }));
      
      setCollaborators(transformedData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar colaboradores",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollaborator = async () => {
    if (!newCollaborator.nome.trim() || !newCollaborator.email.trim()) return;

    try {
      const { error } = await supabase
        .from('usuarios_colaboradores')
        .insert({
          ...newCollaborator,
          user_id: user?.id,
          permissoes: newCollaborator.permissoes
        });

      if (error) throw error;

      toast({
        title: "Colaborador criado",
        description: "O colaborador foi criado com sucesso.",
      });

      setNewCollaborator({
        nome: '',
        email: '',
        telefone: '',
        funcao: 'colaborador',
        permissoes: []
      });
      setIsDialogOpen(false);
      fetchCollaborators();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar colaborador",
        description: error.message,
      });
    }
  };

  const togglePermission = (permission: string) => {
    setNewCollaborator(prev => ({
      ...prev,
      permissoes: prev.permissoes.includes(permission)
        ? prev.permissoes.filter(p => p !== permission)
        : [...prev.permissoes, permission]
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrador': return 'bg-red-100 text-red-800';
      case 'recepcionista': return 'bg-blue-100 text-blue-800';
      case 'mecanico': return 'bg-green-100 text-green-800';
      case 'financeiro': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCollaborators = collaborators.filter(collaborator =>
    collaborator.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaborator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Colaborador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={newCollaborator.nome}
                    onChange={(e) => setNewCollaborator({...newCollaborator, nome: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCollaborator.email}
                    onChange={(e) => setNewCollaborator({...newCollaborator, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={newCollaborator.telefone}
                    onChange={(e) => setNewCollaborator({...newCollaborator, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="funcao">Função</Label>
                  <Select
                    value={newCollaborator.funcao}
                    onValueChange={(value) => setNewCollaborator({...newCollaborator, funcao: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Permissões</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={newCollaborator.permissoes.includes(permission)}
                        onCheckedChange={() => togglePermission(permission)}
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCollaborator}>
                  Criar Colaborador
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores ({filteredCollaborators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCollaborators.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum colaborador encontrado.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Colaborador
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollaborators.map((collaborator) => (
                  <TableRow key={collaborator.id}>
                    <TableCell className="font-medium">{collaborator.nome}</TableCell>
                    <TableCell>{collaborator.email}</TableCell>
                    <TableCell>{collaborator.telefone || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(collaborator.funcao)}>
                        {collaborator.funcao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={collaborator.ativo ? 'default' : 'destructive'}>
                        {collaborator.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Permissões">
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export default CollaboratorsPage;
