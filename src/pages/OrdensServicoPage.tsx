
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OrdemServico {
  id: string;
  user_id: string;
  cliente_id: string;
  status: string;
  valor_total: number;
  created_at: string;
  clients?: {
    nome: string;
    telefone: string;
    veiculo: string;
  };
}

const OrdensServicoPage: React.FC = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrdens = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clients:cliente_id(nome, telefone, veiculo)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrdens(data || []);
    } catch (error: any) {
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

  useEffect(() => {
    fetchOrdens();
  }, [user?.id]);

  const ordensFiltradas = ordens.filter(ordem =>
    ordem.clients?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.clients?.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'bg-blue-100 text-blue-800';
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Aguardando Peças': return 'bg-orange-100 text-orange-800';
      case 'Finalizado': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <Button onClick={() => navigate('/orcamentos')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova OS (via Orçamento)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Ordens de Serviço</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar ordens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordensFiltradas.map((ordem) => (
                <TableRow key={ordem.id}>
                  <TableCell className="font-medium">
                    {ordem.clients?.nome || 'N/A'}
                  </TableCell>
                  <TableCell>{ordem.clients?.veiculo || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ordem.status)}>
                      {ordem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {ordem.valor_total.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(ordem.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
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
