
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Calendar, Clock, User, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Agendamento {
  id: string;
  data_agendamento: string;
  horario: string;
  cliente_id?: string;
  servico_id?: string;
  observacoes?: string;
  status: string;
  created_at: string;
  clients?: {
    nome: string;
    telefone: string;
  };
  services?: {
    nome: string;
  };
}

const AgendamentosPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Agendamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAgendamentos();
  }, []);

  useEffect(() => {
    const filtered = agendamentos.filter(agendamento =>
      agendamento.clients?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.services?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgendamentos(filtered);
  }, [searchTerm, agendamentos]);

  const loadAgendamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clients (nome, telefone),
          services (nome)
        `)
        .order('data_agendamento', { ascending: false });

      if (error) throw error;

      setAgendamentos(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar agendamentos",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Agendamento excluído",
        description: "Agendamento excluído com sucesso!"
      });

      loadAgendamentos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir agendamento",
        description: error.message
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'concluido': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos da sua oficina</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            {agendamentos.length} agendamentos
          </Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, serviço ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAgendamentos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento cadastrado'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAgendamentos.map((agendamento) => (
                <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{formatDate(agendamento.data_agendamento)}</span>
                          <Clock className="h-4 w-4 text-gray-400 ml-4" />
                          <span>{agendamento.horario}</span>
                        </div>
                        
                        {agendamento.clients && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{agendamento.clients.nome}</span>
                            {agendamento.clients.telefone && (
                              <span className="text-sm text-gray-500">({agendamento.clients.telefone})</span>
                            )}
                          </div>
                        )}
                        
                        {agendamento.services && (
                          <p className="text-sm text-gray-600">
                            <strong>Serviço:</strong> {agendamento.services.nome}
                          </p>
                        )}
                        
                        {agendamento.observacoes && (
                          <p className="text-sm text-gray-600">
                            <strong>Observações:</strong> {agendamento.observacoes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(agendamento.status)}>
                          {agendamento.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(agendamento.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default AgendamentosPage;
