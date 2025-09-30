
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Edit, Ban, CheckCircle } from 'lucide-react';
import { useAdminManagement } from '@/hooks/admin/useAdminManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminOficinas = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [formData, setFormData] = useState({
    nome_oficina: '',
    cnpj: '',
    responsavel: '',
    email: '',
    telefone: ''
  });
  
  const { 
    workshops,
    isLoading,
    error,
    fetchWorkshops,
    updateWorkshop,
    blockWorkshop,
    unblockWorkshop
  } = useAdminManagement();

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  const handleBack = () => {
    navigate('/admin');
  };

  const handleEdit = (workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      nome_oficina: workshop.nome_oficina || '',
      cnpj: workshop.cnpj || '',
      responsavel: workshop.responsavel || '',
      email: workshop.email || '',
      telefone: workshop.telefone || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingWorkshop) return;
    
    try {
      await updateWorkshop(editingWorkshop.id, formData);
      setEditingWorkshop(null);
      setFormData({
        nome_oficina: '',
        cnpj: '',
        responsavel: '',
        email: '',
        telefone: ''
      });
    } catch (error) {
      console.error('Erro ao atualizar oficina:', error);
    }
  };

  const handleToggleStatus = async (workshop) => {
    try {
      if (workshop.is_active) {
        await blockWorkshop(workshop.id);
      } else {
        await unblockWorkshop(workshop.id);
      }
      fetchWorkshops(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const filteredWorkshops = workshops.filter(workshop =>
    workshop.nome_oficina?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.cnpj?.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Oficinas</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchWorkshops} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Oficinas</h1>
            <p className="text-gray-600">Visualizar e gerenciar todas as oficinas cadastradas</p>
          </div>
        </div>
        
        <Button onClick={fetchWorkshops} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total de Oficinas</div>
          <div className="text-2xl font-bold text-gray-900">{workshops.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Oficinas Ativas</div>
          <div className="text-2xl font-bold text-green-600">
            {workshops.filter(o => o.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Oficinas Inativas</div>
          <div className="text-2xl font-bold text-red-600">
            {workshops.filter(o => !o.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Com Assinatura Ativa</div>
          <div className="text-2xl font-bold text-purple-600">
            {workshops.filter(o => o.subscription_status === 'active').length}
          </div>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-4">
        <Input
          placeholder="Pesquisar por nome, email ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Tabela de oficinas */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Oficina</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assinatura</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando oficinas...
                </TableCell>
              </TableRow>
            ) : filteredWorkshops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Nenhuma oficina encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkshops.map((workshop) => (
                <TableRow key={workshop.id}>
                  <TableCell className="font-medium">
                    {workshop.nome_oficina || 'Não informado'}
                  </TableCell>
                  <TableCell>{workshop.email || 'Não informado'}</TableCell>
                  <TableCell>{workshop.telefone || 'Não informado'}</TableCell>
                  <TableCell>{workshop.cnpj || 'Não informado'}</TableCell>
                  <TableCell>
                    <Badge variant={workshop.is_active ? "default" : "destructive"}>
                      {workshop.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={workshop.subscription_status === 'active' ? "default" : "secondary"}>
                      {workshop.subscription_status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {workshop.created_at ? formatDate(workshop.created_at) : 'Não informado'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(workshop)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={workshop.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleStatus(workshop)}
                      >
                        {workshop.is_active ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de edição */}
      <Dialog open={!!editingWorkshop} onOpenChange={() => setEditingWorkshop(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Oficina</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome_oficina">Nome da Oficina</Label>
              <Input
                id="nome_oficina"
                value={formData.nome_oficina}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_oficina: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingWorkshop(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOficinas;
