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

    // Formatar placa para busca (adicionar hífen se necessário)
    const formattedPlaca = placa.length === 7 ? 
      `${placa.slice(0, 3)}-${placa.slice(3)}` : 
      placa;

    console.log('Buscando dados para placa:', formattedPlaca);

    // Buscar dados do veículo
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('veiculos')
      .select(`
        id,
        placa,
        marca,
        modelo,
        ano,
        cor,
        clients!inner (
          nome,
          telefone,
          email
        )
      `)
      .eq('placa', formattedPlaca)
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