
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { useAdminData } from '@/hooks/admin/useAdminData';
import { Badge } from '@/components/ui/badge';

const UsersSubscriptionsPage: React.FC = () => {
  const { users, isLoadingUsers, fetchUsers } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nome_oficina?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (subscription: any) => {
    if (!subscription) {
      return <Badge variant="secondary">Sem Assinatura</Badge>;
    }
    
    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500">Em Teste</Badge>;
      case 'cancelled':
        return <Badge className="bg-amber-500">Cancelado</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expirado</Badge>;
      default:
        return <Badge variant="secondary">Inativo</Badge>;
    }
  };

  const getPlanBadge = (subscription: any) => {
    if (!subscription) {
      return <Badge variant="outline">Nenhum</Badge>;
    }
    
    const planType = subscription.plan_type || 'essencial';
    return (
      <Badge variant={planType.includes('premium') ? 'default' : 'secondary'}>
        {planType.includes('premium') ? 'Premium' : 'Essencial'}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gerenciar Usuários e Assinaturas
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie todos os usuários da plataforma e suas assinaturas.
        </p>
      </div>

      {/* Filtros e ações */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros e Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchUsers} disabled={isLoadingUsers}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="text-center py-8">
              <p>Carregando usuários...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b font-medium text-sm">
                <div>Usuário</div>
                <div>Email</div>
                <div>Plano</div>
                <div>Status</div>
                <div>Data de Cadastro</div>
                <div>Ações</div>
              </div>
              
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-b last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">
                          {(user.nome_oficina || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{user.nome_oficina || 'Não definido'}</span>
                    </div>
                    <div className="text-gray-600">{user.email}</div>
                    <div>
                      {getPlanBadge(user.subscription)}
                    </div>
                    <div>
                      {getStatusBadge(user.subscription)}
                    </div>
                    <div className="text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? 'Nenhum usuário encontrado com os critérios de busca.' : 'Nenhum usuário encontrado.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersSubscriptionsPage;
