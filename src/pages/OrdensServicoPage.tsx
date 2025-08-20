
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface OrdemServico {
  id: string;
  cliente_id: string;
  status: string;
  valor_total: number;
  data_inicio: string;
  observacoes?: string;
  clients?: {
    nome: string;
  };
}

const OrdensServicoPage: React.FC = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    carregarOrdens();
  }, []);

  const carregarOrdens = async () => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          cliente_id,
          status,
          valor_total,
          data_inicio,
          observacoes,
          clients!inner(nome)
        `)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        cliente_id: item.cliente_id,
        status: item.status,
        valor_total: item.valor_total,
        data_inicio: item.data_inicio,
        observacoes: item.observacoes,
        clients: Array.isArray(item.clients) 
          ? item.clients[0] 
          : item.clients
      }));
      
      setOrdens(transformedData);
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as ordens de serviço."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ordensFiltradasr = ordens.filter(ordem =>
    ordem.clients?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta': return 'bg-blue-100 text-blue-800';
      case 'em andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluída': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando ordens de serviço...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        </div>
        <Button onClick={() => navigate('/ordens-servico/nova')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem de Serviço
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar ordens de serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordensFiltradasr.map((ordem) => (
                <TableRow key={ordem.id}>
                  <TableCell className="font-medium">
                    #{ordem.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{ordem.clients?.nome || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ordem.status)}>
                      {ordem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {ordem.valor_total?.toFixed(2) || '0,00'}</TableCell>
                  <TableCell>
                    {new Date(ordem.data_inicio).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/ordens-servico/${ordem.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
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

export default OrdensServicoPage;
