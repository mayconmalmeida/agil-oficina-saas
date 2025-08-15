
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import OficinasTable from '@/components/admin/OficinasTable';
import { useOficinasAdmin } from '@/hooks/admin/useOficinasAdmin';

const AdminOficinas = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    oficinas, 
    isLoading, 
    error, 
    fetchOficinas, 
    toggleOficinaStatus,
    deleteOficina 
  } = useOficinasAdmin();

  const handleBack = () => {
    navigate('/admin');
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
          <Button onClick={fetchOficinas} variant="outline">
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
        
        <Button onClick={fetchOficinas} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total de Oficinas</div>
          <div className="text-2xl font-bold text-gray-900">{oficinas.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Oficinas Ativas</div>
          <div className="text-2xl font-bold text-green-600">
            {oficinas.filter(o => o.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Oficinas Inativas</div>
          <div className="text-2xl font-bold text-red-600">
            {oficinas.filter(o => !o.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Com Assinatura Ativa</div>
          <div className="text-2xl font-bold text-purple-600">
            {oficinas.filter(o => o.subscription_status === 'active').length}
          </div>
        </div>
      </div>

      {/* Tabela de oficinas */}
      <div className="bg-white rounded-lg border">
        <OficinasTable
          oficinas={oficinas}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleStatus={toggleOficinaStatus}
          onView={(oficina) => {
            console.log('Ver detalhes da oficina:', oficina);
            // Implementar modal de detalhes se necessário
          }}
          onEdit={(oficina) => {
            console.log('Editar oficina:', oficina);
            // Implementar modal de edição se necessário
          }}
          onDelete={(oficina) => {
            if (window.confirm(`Tem certeza que deseja remover a oficina "${oficina.nome_oficina}"?`)) {
              deleteOficina(oficina.id);
            }
          }}
        />
      </div>
    </div>
  );
};

export default AdminOficinas;
