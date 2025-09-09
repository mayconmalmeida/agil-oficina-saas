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
        cliente_id,
        clients!inner (
          nome,
          telefone,
          email
        )
      `)
      .or(`placa.ilike.${placaOriginal},placa.ilike.${placaSemHifen},placa.ilike.${placaComHifen}`)
      .limit(1)
      .single();

    if (vehicleError) {
      console.error('Erro ao buscar veículo:', vehicleError);
      if (vehicleError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Veículo não encontrado' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        throw vehicleError;
      }
    }

    // Buscar histórico do veículo usando o ID
    const { data: historicoData, error: historicoError } = await supabase
      .from('historicos_veiculo')
      .select(`
        id,
        data_troca,
        km_atual,
        km_proxima,
        tipo_oleo,
        observacoes,
        services (nome, valor)
      `)
      .eq('veiculo_id', vehicleData.id)
      .order('data_troca', { ascending: false });

    if (historicoError) {
      console.error('Erro ao buscar histórico:', historicoError);
      throw historicoError;
    }

    console.log(`Dados encontrados: veículo ${vehicleData.placa}, ${historicoData?.length || 0} históricos`);

    // Retornar dados públicos limitados (sem informações sensíveis)
    const publicData = {
      vehicle: {
        placa: vehicleData.placa,
        marca: vehicleData.marca,
        modelo: vehicleData.modelo,
        ano: vehicleData.ano,
        cor: vehicleData.cor,
        owner: {
          nome: vehicleData.clients.nome,
          telefone: vehicleData.clients.telefone,
          // Não incluir email para proteger privacidade
        }
      },
      history: historicoData?.map(item => ({
        id: item.id,
        data_troca: item.data_troca,
        km_atual: item.km_atual,
        km_proxima: item.km_proxima,
        tipo_oleo: item.tipo_oleo,
        observacoes: item.observacoes,
        service: item.services ? {
          nome: item.services.nome,
          // Não incluir valor do serviço para proteger informações comerciais
        } : null
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