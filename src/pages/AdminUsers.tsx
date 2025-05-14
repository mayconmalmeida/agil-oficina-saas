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
import { Switch } from "@/components/ui/switch";
import { FileText } from "lucide-react";
import { format } from 'date-fns';

// Define defaults for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Inicializando o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type User = {
  id: string;
  email: string;
  nome_oficina: string;
  is_active: boolean;
  created_at: string;
  quote_count: number;
  subscription_status: string;
  trial_ends_at: string | null;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
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
        // Carregar usuários
        fetchUsers();
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const fetchUsers = async () => {
    try {
      // Buscando todos os perfis de usuários com contagem de orçamentos
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          nome_oficina,
          is_active,
          created_at,
          trial_ends_at,
          subscriptions (
            status
          )
        `);

      if (error) {
        throw error;
      }

      // Buscar contagem de orçamentos para cada usuário
      const usersWithQuoteCounts = await Promise.all(data.map(async (user) => {
        const { count } = await supabase
          .from('orcamentos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          ...user,
          quote_count: count || 0,
          subscription_status: user.subscriptions && user.subscriptions[0]?.status || 'none',
        };
      }));

      setUsers(usersWithQuoteCounts);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a lista de usuários.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Atualizar o estado local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));

      toast({
        title: "Status atualizado",
        description: `Usuário ${!currentStatus ? "ativado" : "desativado"} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
      });
    }
  };

  const handleViewQuotes = (userId: string) => {
    navigate(`/admin/user/${userId}/quotes`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando lista de usuários...</p>
      </div>
    );
  }

  const getSubscriptionStatusText = (status: string, trialEndsAt: string | null) => {
    if (status === 'active') return 'Assinatura Ativa';
    
    if (trialEndsAt) {
      const trialDate = new Date(trialEndsAt);
      if (trialDate > new Date()) {
        return `Em teste até ${format(trialDate, 'dd/MM/yyyy')}`;
      }
      return 'Teste expirado';
    }
    
    return 'Sem assinatura';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <Button onClick={() => navigate('/admin/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Table>
          <TableCaption>Lista de todos os usuários registrados</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Oficina</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Status do Plano</TableHead>
              <TableHead className="text-center">Nº de Orçamentos</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome_oficina || 'Não definido'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{format(new Date(user.created_at), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  {getSubscriptionStatusText(user.subscription_status, user.trial_ends_at)}
                </TableCell>
                <TableCell className="text-center">{user.quote_count}</TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={user.is_active}
                    onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewQuotes(user.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Orçamentos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </main>
    </div>
  );
};

export default AdminUsers;
