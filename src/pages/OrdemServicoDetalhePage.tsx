
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import OrdemServicoView from '@/components/ordem-servico/OrdemServicoView';
import Loading from '@/components/ui/loading';

const OrdemServicoDetalhePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ordem, setOrdem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrdemServico();
    }
  }, [id]);

  const fetchOrdemServico = async () => {
    try {
      setIsLoading(true);
      
      // Tentar buscar primeiro na tabela ordens_servico
      let { data: ordemData, error: ordemError } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clients(nome, telefone)
        `)
        .eq('id', id)
        .single();

      if (ordemError && ordemError.code === 'PGRST116') {
        // Se não encontrar na ordens_servico, buscar na agendamentos
        const { data: agendamentoData, error: agendamentoError } = await supabase
          .from('agendamentos')
          .select(`
            *,
            clients(nome, telefone),
            services(nome, valor)
          `)
          .eq('id', id)
          .single();

        if (agendamentoError) throw agendamentoError;

        // Transformar agendamento em formato de ordem de serviço
        ordemData = {
          id: agendamentoData.id,
          cliente_id: agendamentoData.cliente_id,
          data_inicio: agendamentoData.data_agendamento,
          status: agendamentoData.status === 'agendado' ? 'Aberto' : 'Em Andamento',
          observacoes: agendamentoData.observacoes,
          valor_total: agendamentoData.services?.valor || 0,
          cliente_nome: agendamentoData.clients?.nome,
          clients: agendamentoData.clients,
          services: agendamentoData.services
        };
      }

      if (ordemData) {
        setOrdem({
          ...ordemData,
          cliente_nome: ordemData.clients?.nome || ordemData.cliente_nome
        });
      }

    } catch (error: any) {
      console.error('Error fetching ordem servico:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar ordem de serviço",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('ordens_servico')
        .update({ status: novoStatus })
        .eq('id', id);

      if (error) throw error;

      setOrdem(prev => ({ ...prev, status: novoStatus }));
      
      toast({
        title: "Status atualizado",
        description: `Status alterado para: ${novoStatus}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    }
  };

  const handleEdit = () => {
    navigate(`/dashboard/ordem-servico/${id}/editar`);
  };

  if (isLoading) {
    return <Loading text="Carregando ordem de serviço..." fullscreen />;
  }

  if (!ordem) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ordem de Serviço não encontrada</h1>
          <Button onClick={() => navigate('/dashboard/ordem-servico')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/ordem-servico')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <OrdemServicoView
        ordem={ordem}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default OrdemServicoDetalhePage;
