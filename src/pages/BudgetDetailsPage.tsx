
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import BudgetHeader from '@/components/budget/details/BudgetHeader';
import BudgetInfo from '@/components/budget/details/BudgetInfo';
import Loading from '@/components/ui/loading';
import { generateBudgetPDF } from '@/utils/pdfUtils';

interface Budget {
  id: string;
  cliente: string;
  veiculo: string;
  created_at: string;
  valor_total: number;
  descricao: string;
  status: string;
}

const BudgetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBudget = async () => {
      try {
        const { data, error } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBudget(data);
      } catch (error: any) {
        console.error('Error fetching budget:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar orçamento",
          description: error.message,
        });
        navigate('/dashboard/orcamentos');
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, [id, navigate, toast]);

  const handleBack = () => {
    navigate('/dashboard/orcamentos');
  };

  const handlePrint = () => {
    if (budget) {
      try {
        generateBudgetPDF(budget);
        toast({
          title: "PDF gerado com sucesso",
          description: "O orçamento foi enviado para impressão.",
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          variant: "destructive",
          title: "Erro ao gerar PDF",
          description: "Não foi possível gerar o PDF do orçamento.",
        });
      }
    }
  };

  const handleEdit = () => {
    navigate(`/dashboard/orcamentos/editar/${id}`);
  };

  if (loading) {
    return <Loading text="Carregando detalhes do orçamento..." />;
  }

  if (!budget) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Orçamento não encontrado</h2>
          <button onClick={handleBack} className="mt-4 text-blue-500 hover:underline">
            Voltar para orçamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <BudgetHeader
        createdAt={budget.created_at}
        onBack={handleBack}
        onPrint={handlePrint}
        onEdit={handleEdit}
      />
      
      <BudgetInfo
        id={budget.id}
        cliente={budget.cliente}
        veiculo={budget.veiculo}
        created_at={budget.created_at}
        valor_total={budget.valor_total}
        descricao={budget.descricao}
        status={budget.status}
      />
    </div>
  );
};

export default BudgetDetailsPage;
