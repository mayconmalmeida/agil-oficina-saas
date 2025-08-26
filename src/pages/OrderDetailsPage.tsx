import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Printer, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Loading from '@/components/ui/loading';

interface OrderDetails {
  id: string;
  valor_total: number;
  status: string;
  observacoes: string;
  created_at: string;
  data_inicio: string;
  data_fim?: string;
  clients: {
    nome: string;
    telefone: string;
    email?: string;
  } | null;
  veiculos?: {
    marca: string;
    modelo: string;
    ano: string;
    placa: string;
  } | null;
  ordem_servico_itens: Array<{
    id: string;
    nome_item: string;
    tipo: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
  }>;
}

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && user?.id) {
      fetchOrderDetails();
    }
  }, [id, user?.id]);

  const fetchOrderDetails = async () => {
    if (!id || !user?.id) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clients (
            nome,
            telefone,
            email
          ),
          veiculos (
            marca,
            modelo,
            ano,
            placa
          ),
          ordem_servico_itens (
            id,
            nome_item,
            tipo,
            quantidade,
            valor_unitario,
            valor_total
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Fix clients and veiculos types
      const transformedData = {
        ...data,
        clients: Array.isArray(data.clients) ? data.clients[0] : data.clients,
        veiculos: Array.isArray(data.veiculos) ? data.veiculos[0] : data.veiculos
      } as OrderDetails;

      setOrder(transformedData);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes da ordem:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os detalhes da ordem de serviço.",
      });
      navigate('/dashboard/ordens-servico');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Aberta': 'default',
      'Em Andamento': 'secondary',
      'Concluída': 'default',
      'Cancelada': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isLoading) {
    return <Loading fullscreen text="Carregando detalhes da ordem..." />;
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Ordem de serviço não encontrada.</p>
          <Button onClick={() => navigate('/dashboard/ordens-servico')}>
            Voltar às Ordens
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/ordens-servico')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ordem de Serviço</h1>
            <p className="text-muted-foreground">#{order.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Ordem */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Ordem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor Total</label>
                  <p className="text-lg font-bold">{formatCurrency(order.valor_total)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                  <p>{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Início</label>
                  <p>{new Date(order.data_inicio).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              {order.observacoes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observações</label>
                  <p className="mt-1">{order.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Itens da Ordem */}
          <Card>
            <CardHeader>
              <CardTitle>Itens e Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.ordem_servico_itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome_item}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.tipo}</Badge>
                      </TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{formatCurrency(item.valor_unitario)}</TableCell>
                      <TableCell>{formatCurrency(item.valor_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com informações do cliente */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="font-medium">{order.clients?.nome || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                <p>{order.clients?.telefone || 'N/A'}</p>
              </div>
              {order.clients?.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{order.clients.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {order.veiculos && (
            <Card>
              <CardHeader>
                <CardTitle>Veículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Veículo</label>
                  <p className="font-medium">{order.veiculos.marca} {order.veiculos.modelo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ano</label>
                  <p>{order.veiculos.ano}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Placa</label>
                  <p>{order.veiculos.placa}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;