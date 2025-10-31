import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const placa = url.searchParams.get('placa');

    if (!placa) {
      return new Response(
        JSON.stringify({ error: 'Placa é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const placaOriginal = placa.toUpperCase();
    const placaSemHifen = placaOriginal.replace('-', '');
    const placaComHifen = placaSemHifen.length === 7 ? `${placaSemHifen.slice(0, 3)}-${placaSemHifen.slice(3)}` : placaOriginal;

    console.log('Buscando dados para placa:', placaOriginal, 'tentativas:', [placaOriginal, placaSemHifen, placaComHifen]);

    const { data: vehicleData, error: vehicleError } = await supabase
      .from('veiculos')
      .select(`id, placa, marca, modelo, ano, cor, cliente_id, user_id`)
      .or(`placa.eq.${placaOriginal},placa.eq.${placaSemHifen},placa.eq.${placaComHifen}`)
      .limit(1)
      .single();

    if (vehicleError || !vehicleData) {
      console.error('Veículo não encontrado:', vehicleError);
      return new Response(
        JSON.stringify({ error: 'Veículo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: clientData } = await supabase
      .from('profiles')
      .select('nome, telefone')
      .eq('id', vehicleData.cliente_id)
      .single();

    const { data: workshopData } = await supabase
      .from('profiles')
      .select('telefone, nome_oficina')
      .eq('id', vehicleData.user_id)
      .single();

    const concludedStatuses = ['Concluída','Concluido','Concluído','Finalizado','finalizado','concluido','concluída'];
    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('id, veiculo_id, data_inicio, data_fim, valor_total, observacoes, status')
      .eq('veiculo_id', vehicleData.id)
      .in('status', concludedStatuses)
      .order('data_fim', { ascending: false });

    if (ordensError) {
      console.error('Erro buscando ordens de serviço:', ordensError);
    }

    let itensData: any[] = [];
    if (ordensData && ordensData.length > 0) {
      const ordensIds = ordensData.map((o: any) => o.id);
      const { data: osItens, error: osItensError } = await supabase
        .from('ordem_servico_itens')
        .select('ordem_servico_id, nome_item, tipo, quantidade, valor_unitario, valor_total')
        .in('ordem_servico_id', ordensIds);
      if (!osItensError && osItens) itensData = osItens;
    }

    const { data: pendingBudgets, error: pendingError } = await supabase
      .from('orcamentos')
      .select('id, cliente, veiculo, descricao, valor_total, status, created_at, veiculo_id')
      .eq('veiculo_id', vehicleData.id)
      .eq('status', 'pendente')
      .order('created_at', { ascending: false });

    const { data: approvedBudgets, error: approvedError } = await supabase
      .from('orcamentos')
      .select('id, cliente, veiculo, descricao, valor_total, status, created_at, veiculo_id')
      .eq('veiculo_id', vehicleData.id)
      .eq('status', 'aprovado')
      .order('created_at', { ascending: false });

    let budgetItems: any[] = [];
    const allBudgetIds = [...(pendingBudgets?.map((b: any) => b.id) || []), ...(approvedBudgets?.map((b: any) => b.id) || [])];
    if (allBudgetIds.length > 0) {
      const { data: itensBudget, error: itensBudgetError } = await supabase
        .from('orcamento_itens')
        .select('orcamento_id, nome, tipo, quantidade, valor_unitario, valor_total');
        //.in('orcamento_id', allBudgetIds);
      if (!itensBudgetError && itensBudget) budgetItems = itensBudget;
    }

    console.log(`Dados encontrados: veículo ${vehicleData.placa}, ${ordensData?.length || 0} ordens concluídas, ${(pendingBudgets?.length || 0)} orçamentos pendentes, ${(approvedBudgets?.length || 0)} aprovados`);

    const publicData = {
      vehicle: {
        placa: vehicleData.placa,
        marca: vehicleData.marca,
        modelo: vehicleData.modelo,
        ano: vehicleData.ano,
        cor: vehicleData.cor,
        owner: clientData ? { nome: clientData.nome, telefone: clientData.telefone } : null,
      },
      workshop: workshopData ? { telefone: workshopData.telefone, nome: workshopData.nome_oficina } : null,
      serviceOrders: (ordensData || []).map((ordem: any) => ({
        id: ordem.id,
        data_inicio: ordem.data_inicio,
        data_fim: ordem.data_fim,
        valor_total: ordem.valor_total,
        observacoes: ordem.observacoes,
        status: ordem.status,
        itens: (itensData || []).filter(item => item.ordem_servico_id === ordem.id).map(item => ({
          nome_item: item.nome_item,
          tipo: item.tipo,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
        }))
      })),
      pendingBudgets: (pendingBudgets || []).map((orcamento: any) => ({
        id: orcamento.id,
        cliente: orcamento.cliente,
        veiculo: orcamento.veiculo,
        descricao: orcamento.descricao,
        valor_total: orcamento.valor_total,
        status: orcamento.status,
        created_at: orcamento.created_at,
        itens: (budgetItems || []).filter(i => i.orcamento_id === orcamento.id).map(i => ({
          nome: i.nome,
          tipo: i.tipo,
          quantidade: i.quantidade,
          valor_unitario: i.valor_unitario,
          valor_total: i.valor_total,
        }))
      })),
      approvedBudgets: (approvedBudgets || []).map((orcamento: any) => ({
        id: orcamento.id,
        cliente: orcamento.cliente,
        veiculo: orcamento.veiculo,
        descricao: orcamento.descricao,
        valor_total: orcamento.valor_total,
        status: orcamento.status,
        created_at: orcamento.created_at,
        itens: (budgetItems || []).filter(i => i.orcamento_id === orcamento.id).map(i => ({
          nome: i.nome,
          tipo: i.tipo,
          quantidade: i.quantidade,
          valor_unitario: i.valor_unitario,
          valor_total: i.valor_total,
        }))
      })),
    };

    return new Response(JSON.stringify(publicData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Erro na função get-vehicle-history:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
