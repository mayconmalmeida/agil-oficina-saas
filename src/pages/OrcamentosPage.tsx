
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Orcamento {
  id: string;
  numero: string;
  cliente_nome: string;
  valor_total: number;
  status: string;
  data_criacao: string;
  validade: string;
}

const OrcamentosPage: React.FC = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrcamentos();
  }, [user?.id]);

  const fetchOrcamentos = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      // This is a placeholder - you would implement this based on your database schema
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('user_id', user.id)
        .order('data_criacao', { ascending: false });

      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
        throw error;
      }
      
      // For now, using mock data since table might not exist
      setOrcamentos([
        {
          id: '1',
          numero: 'ORC-001',
          cliente_nome: 'João Silva',
          valor_total: 1500.00,
          status: 'pendente',
          data_criacao: '2024-01-15',
          validade: '2024-02-15'
        },
        {
          id: '2',
          numero: 'ORC-002',
          cliente_nome: 'Maria Santos',
          valor_total: 2800.00,
          status: 'aprovado',
          data_criacao: '2024-01-16',
          validade: '2024-02-16'
        }
      ]);
    } catch (error: any) {
      console.error('Erro ao carregar orçamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar orçamentos",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrcamentos = orcamentos.filter(orcamento =>
    orcamento.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    orcamento.numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="default">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'expirado':
        return <Badge variant="outline">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/orcamentos/novo')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por cliente ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Orçamentos ({filteredOrcamentos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrcamentos.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum orçamento encontrado.</p>
              <Button onClick={() => navigate('/dashboard/orcamentos/novo')}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Orçamento
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrcamentos.map((orcamento) => (
                  <TableRow key={orcamento.id}>
                    <TableCell className="font-medium">{orcamento.numero}</TableCell>
                    <TableCell>{orcamento.cliente_nome}</TableCell>
                    <TableCell>R$ {orcamento.valor_total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(orcamento.status)}</TableCell>
                    <TableCell>{new Date(orcamento.data_criacao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(orcamento.validade).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
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
    </div>
  );
};

export default OrcamentosPage;
