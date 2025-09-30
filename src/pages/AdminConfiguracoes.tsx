import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Save, Edit } from 'lucide-react';
import { useAdminManagement } from '@/hooks/admin/useAdminManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const AdminConfiguracoes = () => {
  const navigate = useNavigate();
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    value: '',
    description: ''
  });
  
  const { 
    configurations,
    isLoading,
    error,
    fetchConfigurations,
    updateConfiguration
  } = useAdminManagement();

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  const handleBack = () => {
    navigate('/admin');
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      value: config.value || '',
      description: config.description || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingConfig) return;
    
    try {
      await updateConfiguration(editingConfig.id, formData.value);
      setEditingConfig(null);
      setFormData({
        value: '',
        description: ''
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      checkout: 'Checkout',
      whatsapp: 'WhatsApp',
      messages: 'Mensagens',
      system: 'Sistema'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      checkout: 'bg-blue-100 text-blue-800',
      whatsapp: 'bg-green-100 text-green-800',
      messages: 'bg-purple-100 text-purple-800',
      system: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const groupedConfigurations = configurations.reduce((acc: Record<string, any[]>, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {});

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Configurações Globais</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchConfigurations} variant="outline">
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
            <h1 className="text-2xl font-bold text-gray-900">Configurações Globais</h1>
            <p className="text-gray-600">Gerencie links de checkout, WhatsApp e mensagens automáticas</p>
          </div>
        </div>
        
        <Button onClick={fetchConfigurations} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total de Configurações</div>
          <div className="text-2xl font-bold text-gray-900">{configurations.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Checkout</div>
          <div className="text-2xl font-bold text-blue-600">
            {configurations.filter(c => c.category === 'checkout').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">WhatsApp</div>
          <div className="text-2xl font-bold text-green-600">
            {configurations.filter(c => c.category === 'whatsapp').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Mensagens</div>
          <div className="text-2xl font-bold text-purple-600">
            {configurations.filter(c => c.category === 'messages').length}
          </div>
        </div>
      </div>

      {/* Configurações por categoria */}
      <div className="space-y-6">
        {Object.entries(groupedConfigurations).map(([category, configs]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={getCategoryColor(category)}>
                  {getCategoryLabel(category)}
                </Badge>
                <span>{configs.length} configuração(ões)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configs.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{config.key}</h3>
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      {config.description && (
                        <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                      )}
                      <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                        {config.value}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(config)}
                      className="ml-4"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p>Carregando configurações...</p>
        </div>
      )}

      {/* Modal de edição */}
      <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Configuração</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chave</Label>
              <Input
                value={editingConfig?.key || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                value={editingConfig ? getCategoryLabel(editingConfig.category) : ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="value">Valor</Label>
              {editingConfig?.category === 'messages' ? (
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  rows={4}
                />
              ) : (
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                />
              )}
            </div>
            {editingConfig?.description && (
              <div>
                <Label>Descrição</Label>
                <Input
                  value={editingConfig.description}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingConfig(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminConfiguracoes;