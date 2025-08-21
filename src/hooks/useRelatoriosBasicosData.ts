
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RelatorioBasicoData {
  totalClientes: number;
  totalOrcamentos: number;
  totalServicos: number;
  faturamentoTotal: number;
  graficoMensal: {
    month: string;
    orcamentos: number;
    servicos: number;
    faturamento: number;
  }[];
  ultimosServicos: {
    id: string;
    cliente_nome: string;
    valor_total: number;
    status: string;
    created_at: string;
  }[];
}

function formatMonth(date: string) {
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function useRelatoriosBasicosData() {
  const [data, setData] = useState<RelatorioBasicoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Verificar se há usuário autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('Usuário não autenticado');
          setData({
            totalClientes: 0,
            totalOrcamentos: 0,
            totalServicos: 0,
            faturamentoTotal: 0,
            graficoMensal: [],
            ultimosServicos: []
          });
          setLoading(false);
          return;
        }

        // 1. Total de Clientes
        const { count: totalClientes } = await supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq('user_id', user.id);

        // 2. Total de Orçamentos
        const { count: totalOrcamentos } = await supabase
          .from("orcamentos")
          .select("id", { count: "exact", head: true })
          .eq('user_id', user.id);

        // 3. Total de Serviços
        const { count: totalServicos } = await supabase
          .from("services")
          .select("id", { count: "exact", head: true })
          .eq('user_id', user.id);

        // 4. Faturamento total a partir de ordens de serviço finalizadas
        let faturamentoTotal = 0;
        {
          const { data: ordensFinalizadas } = await supabase
            .from("ordens_servico")
            .select("valor_total")
            .eq('user_id', user.id)
            .eq('status', 'Concluída')
            .limit(1000);
          
          if (ordensFinalizadas && Array.isArray(ordensFinalizadas)) {
            faturamentoTotal = ordensFinalizadas.reduce(
              (acc, cur) => acc + (Number(cur.valor_total) || 0),
              0
            );
          }
        }

        // 5. Gráfico mensal: Orçamentos e OS por mês (últimos 6 meses)
        const { data: orcamentosMes } = await supabase
          .from("orcamentos")
          .select("created_at, valor_total")
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false });

        const { data: ordens } = await supabase
          .from("ordens_servico")
          .select("created_at, valor_total")
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false });

        type ByMonth = { [month: string]: { orcamentos: number, servicos: number, faturamento: number } };
        const byMonth: ByMonth = {};

        // Processar orçamentos
        if (orcamentosMes) {
          for (const o of orcamentosMes) {
            const month = formatMonth(o.created_at);
            if (!byMonth[month]) byMonth[month] = { orcamentos: 0, servicos: 0, faturamento: 0 };
            byMonth[month].orcamentos += 1;
          }
        }

        // Processar ordens de serviço
        if (ordens) {
          for (const s of ordens) {
            const month = formatMonth(s.created_at);
            if (!byMonth[month]) byMonth[month] = { orcamentos: 0, servicos: 0, faturamento: 0 };
            byMonth[month].servicos += 1;
            byMonth[month].faturamento += Number(s.valor_total || 0);
          }
        }

        const mesesOrdenados = Object.keys(byMonth)
          .sort((a, b) => {
            const [ma, ya] = a.split("/").map(Number);
            const [mb, yb] = b.split("/").map(Number);
            return yb !== ya ? yb - ya : mb - ma;
          })
          .slice(0, 6)
          .reverse();

        const graficoMensal = mesesOrdenados.map(month => ({
          month,
          ...byMonth[month]
        }));

        // 6. Últimos serviços (ordens de serviço)
        const { data: ultimasOrdens } = await supabase
          .from("ordens_servico")
          .select(`
            id, 
            valor_total, 
            status, 
            created_at,
            cliente_id,
            clients!inner(nome)
          `)
          .eq('user_id', user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        let ultimosServicos: RelatorioBasicoData["ultimosServicos"] = [];
        if (ultimasOrdens && ultimasOrdens.length > 0) {
          ultimosServicos = ultimasOrdens.map((ordem: any) => ({
            id: ordem.id,
            cliente_nome: ordem.clients?.nome || "Cliente não informado",
            valor_total: Number(ordem.valor_total) || 0,
            status: ordem.status || "Sem status",
            created_at: ordem.created_at,
          }));
        }

        setData({
          totalClientes: totalClientes ?? 0,
          totalOrcamentos: totalOrcamentos ?? 0,
          totalServicos: totalServicos ?? 0,
          faturamentoTotal,
          graficoMensal,
          ultimosServicos,
        });
        
      } catch (error) {
        console.error('Erro ao buscar dados dos relatórios:', error);
        setData({
          totalClientes: 0,
          totalOrcamentos: 0,
          totalServicos: 0,
          faturamentoTotal: 0,
          graficoMensal: [],
          ultimosServicos: []
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading };
}
