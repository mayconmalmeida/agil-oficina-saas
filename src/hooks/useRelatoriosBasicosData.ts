
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

// Helper para extrair mês/ano em formato "MM/YYYY"
function formatMonth(date: string) {
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function useRelatoriosBasicosData() {
  const [data, setData] = useState<RelatorioBasicoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // 1. Total de Clientes
      const { count: totalClientes } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true });

      // 2. Total de Orçamentos
      const { count: totalOrcamentos } = await supabase
        .from("orcamentos")
        .select("id", { count: "exact", head: true });

      // 3. Total de Serviços
      const { count: totalServicos } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true });

      // 4. Faturamento total: usamos valor_total em orcamentos e/ou services
      let faturamentoTotal = 0;
      {
        const { data: servicios } = await supabase
          .from("services")
          .select("valor")
          .limit(5000); // limite "alto" p/ apps PMEs

        if (servicios && Array.isArray(servicios)) {
          faturamentoTotal = servicios.reduce(
            (acc, cur) => acc + (Number(cur.valor) || 0),
            0
          );
        }
      }

      // 5. Gráfico mensal: Orçamentos e Serviços criados por mês (últimos 6 meses)
      // Agrupar por "MM/YYYY"
      const { data: orcamentosMes } = await supabase
        .from("orcamentos")
        .select("created_at, valor_total")
        .order("created_at", { ascending: false })
        .limit(200);

      const { data: servicosMes } = await supabase
        .from("services")
        .select("created_at, valor")
        .order("created_at", { ascending: false })
        .limit(200);

      type ByMonth = { [month: string]: { orcamentos: number, servicos: number, faturamento: number } };
      const byMonth: ByMonth = {};

      if (orcamentosMes) {
        for (const o of orcamentosMes) {
          const month = formatMonth(o.created_at);
          if (!byMonth[month]) byMonth[month] = { orcamentos: 0, servicos: 0, faturamento: 0 };
          byMonth[month].orcamentos += 1;
          byMonth[month].faturamento += Number(o.valor_total || 0);
        }
      }
      if (servicosMes) {
        for (const s of servicosMes) {
          const month = formatMonth(s.created_at);
          if (!byMonth[month]) byMonth[month] = { orcamentos: 0, servicos: 0, faturamento: 0 };
          byMonth[month].servicos += 1;
          byMonth[month].faturamento += Number(s.valor || 0);
        }
      }

      // Pegar últimos 6 meses presentes
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

      // 6. Últimos 10 serviços realizados
      const { data: ultimosServicosRaw } = await supabase
        .from("services")
        .select("id, cliente_id, valor, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      // Buscar nomes dos clientes (faremos com uma segunda consulta, caso cliente_id esteja presente)
      let ultimosServicos: RelatorioBasicoData["ultimosServicos"] = [];
      if (ultimosServicosRaw && ultimosServicosRaw.length > 0) {
        const clienteIds = ultimosServicosRaw.map((s) => s.cliente_id).filter(Boolean);
        let clientesMap: { [id: string]: string } = {};
        if (clienteIds.length > 0) {
          const { data: clientesData } = await supabase
            .from("clients")
            .select("id, nome")
            .in("id", clienteIds);

          if (clientesData)
            for (const c of clientesData)
              clientesMap[c.id] = c.nome;
        }
        ultimosServicos = ultimosServicosRaw.map((servico) => ({
          id: servico.id,
          cliente_nome: clientesMap[servico.cliente_id] || "-",
          valor_total: Number(servico.valor) || 0,
          status: servico.status || "-",
          created_at: servico.created_at,
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
      setLoading(false);
    }

    fetchData();
  }, []);

  return { data, loading };
}
