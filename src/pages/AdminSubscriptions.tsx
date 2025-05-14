
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Inicializando o cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Subscription = {
  id: string;
  user_id: string;
  email: string;
  nome_oficina: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  payment_method: string;
  amount: number;
};

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se o usuário é um administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (!adminData) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
      } else {
        // Carregar assinaturas
        fetchSubscriptions();
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const fetchSubscriptions = async () => {
    try {
      // Buscando todas as assinaturas com informações dos usuários
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          status,
          created_at,
          expires_at,
          payment_method,
          amount,
          profiles (
            email,
            nome_oficina
          )
        `);

      if (error) {
        throw error;
      }

      // Formatando os dados para apresentação
      const formattedSubscriptions = data.map(sub => ({
        ...sub,
        email: sub.profiles?.email || 'N/A',
        nome_oficina: sub.profiles?.nome_oficina || 'N/A'
      }));

      setSubscriptions(formattedSubscriptions);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a lista de assinaturas.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativa</Badge>;
      case 'cancelled':
        return <Badge className="bg-amber-500">Cancelada</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expirada</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando lista de assinaturas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Gerenciamento de Assinaturas</h1>
          <Button onClick={() => navigate('/admin/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Table>
          <TableCaption>Lista de todas as assinaturas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Oficina</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data de Início</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Método de Pagamento</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.nome_oficina}</TableCell>
                <TableCell>{sub.email}</TableCell>
                <TableCell>R$ {(sub.amount / 100).toFixed(2)}</TableCell>
                <TableCell>{format(new Date(sub.created_at), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  {sub.expires_at ? format(new Date(sub.expires_at), 'dd/MM/yyyy') : 'N/A'}
                </TableCell>
                <TableCell>{sub.payment_method || 'N/A'}</TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(sub.status)}
                </TableCell>
              </TableRow>
            ))}
            {subscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhuma assinatura encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </main>
    </div>
  );
};

export default AdminSubscriptions;
