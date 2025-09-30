import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const placa = url.searchParams.get('placa');

    if (!placa) {
      return new Response(
        JSON.stringify({ error: 'Placa é obrigatória' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with service role key for secure access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Formatar placa para busca (tentar com e sem hífen)
    const placaOriginal = placa.toUpperCase();
    const placaSemHifen = placaOriginal.replace('-', '');
    const placaComHifen = placaSemHifen.length === 7 ? 
      `${placaSemHifen.slice(0, 3)}-${placaSemHifen.slice(3)}` : 
      placaOriginal;

    console.log('Buscando dados para placa:', placaOriginal, 'tentativas:', [placaOriginal, placaSemHifen, placaComHifen]);

    // Buscar dados do veículo (tentar múltiplos formatos)
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('veiculos')
      .select(`
        id,
        placa,
        marca,
        modelo,
        ano,
        cor,
        cliente_id
      `)
      .or(`placa.eq.${placaOriginal},placa.eq.${placaSemHifen},placa.eq.${placaComHifen}`)
      .limit(1)
      .maybeSingle();

    if (vehicleError) {
      console.error('Erro ao buscar veículo:', vehicleError);
      throw vehicleError;
    }

    if (!vehicleData) {
      console.log('Veículo não encontrado para placa:', placaOriginal);
      return new Response(
        JSON.stringify({ error: 'Veículo não encontrado' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar dados do cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('nome, telefone, email')
      .eq('id', vehicleData.cliente_id)
      .maybeSingle();

    if (clientError) {
      console.error('Erro ao buscar cliente:', clientError);
    }

    // Buscar ordens de serviço concluídas do veículo
    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select(`
        id,
        data_inicio,
        data_fim,
        valor_total,
        observacoes,
        status
      `)
      .eq('veiculo_id', vehicleData.id)
      .eq('status', 'Concluída')
      .order('data_fim', { ascending: false });

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
    }

    // Buscar orçamentos pendentes do cliente
    const { data: orcamentosData, error: orcamentosError } = await supabase
      .from('orcamentos')
      .select(`
        id,
        cliente,
        veiculo,
        descricao,
        valor_total,
        status,
        created_at
      `)
      .eq('cliente', clientData?.nome || '')
      .eq('status', 'pendente')
      .order('created_at', { ascending: false });

    if (orcamentosError) {
      console.error('Erro ao buscar orçamentos pendentes:', orcamentosError);
    }

    // Buscar itens das ordens de serviço
    let itensData = [];
    if (ordensData && ordensData.length > 0) {
      const ordensIds = ordensData.map(ordem => ordem.id);
      
      const { data: itens, error: itensError } = await supabase
        .from('ordem_servico_itens')
        .select(`
          ordem_servico_id,
          nome_item,
          tipo,
          quantidade,
          valor_unitario,
          valor_total
        `)
        .in('ordem_servico_id', ordensIds);

      if (itensError) {
        console.error('Erro ao buscar itens das ordens:', itensError);
      } else {
        itensData = itens || [];
      }
    }

    console.log(`Dados encontrados: veículo ${vehicleData.placa}, ${ordensData?.length || 0} ordens concluídas, ${orcamentosData?.length || 0} orçamentos pendentes`);

    // Retornar dados públicos limitados (sem informações sensíveis)
    const publicData = {
      vehicle: {
        placa: vehicleData.placa,
        marca: vehicleData.marca,
        modelo: vehicleData.modelo,
        ano: vehicleData.ano,
        cor: vehicleData.cor,
        owner: clientData ? {
          nome: clientData.nome,
          telefone: clientData.telefone,
          // Não incluir email para proteger privacidade
        } : null
      },
      serviceOrders: ordensData?.map(ordem => ({
        id: ordem.id,
        data_inicio: ordem.data_inicio,
        data_fim: ordem.data_fim,
        valor_total: ordem.valor_total,
        observacoes: ordem.observacoes,
        status: ordem.status,
        itens: itensData.filter(item => item.ordem_servico_id === ordem.id).map(item => ({
          nome_item: item.nome_item,
          tipo: item.tipo,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total
        }))
      })) || [],
      pendingBudgets: orcamentosData?.map(orcamento => ({
        id: orcamento.id,
        cliente: orcamento.cliente,
        veiculo: orcamento.veiculo,
        descricao: orcamento.descricao,
        valor_total: orcamento.valor_total,
        status: orcamento.status,
        created_at: orcamento.created_at
      })) || []
    };

    return new Response(
      JSON.stringify(publicData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na função get-vehicle-history:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});