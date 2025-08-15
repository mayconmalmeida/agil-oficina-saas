
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Calendar, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface Agendamento {
  id: string;
  data_agendamento: string;
  horario: string;
  cliente_id: string | null;
  servico_id: string | null;
  observacoes: string | null;
  status: string;
  created_at: string;
}

const AgendamentosPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingAgendamento, setDeletingAgendamento] = useState<Agendamento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('data_agendamento', { ascending: true });

      if (error) throw error;
      setAgendamentos(data || []);
    } catch (error: any) {
      console.error('Error fetching agendamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar agendamentos",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgendamento = async () => {
    if (!deletingAgendamento) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', deletingAgendamento.id);

      if (error) throw error;

      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });

      fetchAgendamentos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir agendamento",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
      setDeletingAgendamento(null);
    }
  };

  const filteredAgendamentos = agendamentos.filter(agendamento =>
    agendamento.observacoes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
          <Calendar className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        </div>
        <Link to="/dashboard/agendamentos/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por observações ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos ({filteredAgendamentos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAgendamentos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum agendamento encontrado.</p>
              <Link to="/dashboard/agendamentos/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Agendamento
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgendamentos.map((agendamento) => (
                  <TableRow key={agendamento.id}>
                    <TableCell>{formatDate(agendamento.data_agendamento)}</TableCell>
                    <TableCell>{agendamento.horario}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agendamento.status === 'agendado' 
                          ? 'bg-blue-100 text-blue-800'
                          : agendamento.status === 'concluido'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agendamento.status}
                      </span>
                    </TableCell>
                    <TableCell>{agendamento.observacoes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeletingAgendamento(agendamento)}
                        >
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

      <ConfirmDialog
        isOpen={!!deletingAgendamento}
        onClose={() => setDeletingAgendamento(null)}
        onConfirm={handleDeleteAgendamento}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AgendamentosPage;
