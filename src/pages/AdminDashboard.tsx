import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatsOverview from "@/components/admin/StatsOverview";
import SectionLink from "@/components/admin/SectionLink";
import { useAdminData } from '@/hooks/admin/useAdminData';
import { useAdminManagement } from '@/hooks/admin/useAdminManagement';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { RefreshCw, Edit, Ban, CheckCircle, Search, Settings, Users, CreditCard, Package } from 'lucide-react';

const AdminDashboard = () => {
  const { stats, isLoadingStats, fetchStats } = useAdminData();
  const { 
    workshops,
    isLoading,
    error,
    fetchWorkshops,
    updateWorkshop,
    blockWorkshop,
    unblockWorkshop
  } = useAdminManagement();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    console.log('AdminDashboard: Carregando dados...');
    fetchStats();
    fetchWorkshops();
  }, [fetchStats, fetchWorkshops]);

  const handleToggleStatus = async (workshop) => {
    try {
      if (workshop.is_active) {
        await blockWorkshop(workshop.id);
      } else {
        await unblockWorkshop(workshop.id);
      }
      fetchWorkshops();
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

  if (isLoadingStats || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  const isStatsEmpty =
    !stats ||
    Object.keys(stats).every((k) => stats[k] === 0 || stats[k] == null);

  if (isStatsEmpty && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900">
          Erro ao carregar dados administrativos
        </h2>
        <p className="mt-2 text-gray-500">
          {error}
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            fetchStats();
            fetchWorkshops();
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'oficinas':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gerenciar Oficinas</h2>
                <p className="text-gray-600">Visualizar e gerenciar todas as oficinas cadastradas</p>
              </div>
              <Button onClick={fetchWorkshops} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>

            {/* Estatísticas das oficinas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="text-sm text-gray-600">Oficinas Bloqueadas</div>
                <div className="text-2xl font-bold text-red-600">
                  {workshops.filter(o => !o.is_active).length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Cadastros Hoje</div>
                <div className="text-2xl font-bold text-blue-600">
                  {workshops.filter(o => {
                    const today = new Date().toDateString();
                    const createdDate = new Date(o.created_at).toDateString();
                    return today === createdDate;
                  }).length}
                </div>
              </div>
            </div>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabela de oficinas */}
            <div className="bg-white rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oficina</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkshops.map((workshop) => (
                    <TableRow key={workshop.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{workshop.nome_oficina}</div>
                          <div className="text-sm text-gray-500">{workshop.responsavel}</div>
                        </div>
                      </TableCell>
                      <TableCell>{workshop.email}</TableCell>
                      <TableCell>{workshop.cnpj}</TableCell>
                      <TableCell>
                        <Badge variant={workshop.is_active ? "default" : "destructive"}>
                          {workshop.is_active ? "Ativa" : "Bloqueada"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(workshop.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            <StatsOverview stats={stats} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SectionLink 
                title="Gerenciar Oficinas"
                buttonText="Ver Todas as Oficinas"
                onNavigate={() => setActiveTab('oficinas')}
              />

              <SectionLink 
                title="Gerenciar Assinaturas"
                buttonText="Ver Todas as Assinaturas"
                onNavigate={() => navigate('/admin/subscriptions')}
              />

              <SectionLink 
                title="Gerenciar Planos"
                buttonText="Editar Planos e Preços"
                onNavigate={() => navigate('/admin/plans')}
              />

              <SectionLink 
                title="Configurações Globais"
                buttonText="Gerenciar Configurações"
                onNavigate={() => navigate('/admin/configuracoes')}
              />

              <SectionLink 
                title="Usuários Administrativos"
                buttonText="Gerenciar Admins"
                onNavigate={() => navigate('/admin/users')}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header com navegação */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Visão geral do sistema OficinaÁgil</p>
            </div>
          </div>

          {/* Menu de navegação */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 border">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('oficinas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'oficinas'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Oficinas
            </button>
          </div>
        </div>

        {renderDashboardContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
