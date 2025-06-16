
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Recebendo requisição para ai-assistant')
    
    const requestBody = await req.json()
    console.log('Body da requisição:', requestBody)
    
    const { type, message } = requestBody
    
    if (!type || !message) {
      throw new Error('Parâmetros type e message são obrigatórios')
    }
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    console.log('OpenAI API Key presente:', !!openAIApiKey)

    if (!openAIApiKey) {
      throw new Error('Chave da API OpenAI não configurada. Configure OPENAI_API_KEY nos secrets do Supabase.')
    }

    let systemPrompt = ''
    
    if (type === 'diagnostico') {
      systemPrompt = `Você é um especialista em diagnóstico automotivo com vasta experiência em mecânica de veículos. 
      Analise os sintomas descritos pelo usuário e forneça as 3-5 possíveis causas mais prováveis.
      Seja específico e técnico, mas mantenha a linguagem acessível.
      Responda apenas com as possíveis causas, uma por linha, sem numeração.`
    } else if (type === 'suporte') {
      systemPrompt = `Você é um assistente especializado no sistema de gestão de oficinas mecânicas OficinaCloud.

FUNCIONALIDADES PRINCIPAIS DO SISTEMA:

**GESTÃO DE CLIENTES:**
- Cadastrar novos clientes com dados pessoais, contato e informações do veículo
- Visualizar lista de clientes cadastrados
- Editar informações de clientes existentes
- Buscar clientes por nome, telefone ou placa
- Cada cliente pode ter múltiplos veículos associados

**GESTÃO DE VEÍCULOS:**
- Cadastrar veículos com marca, modelo, ano, placa, cor e quilometragem
- Busca automática de dados do veículo pela placa
- Histórico de serviços por veículo
- Controle de quilometragem

**ORÇAMENTOS:**
- Criar orçamentos para clientes
- Adicionar serviços e produtos aos orçamentos
- Calcular valores totais automaticamente
- Converter orçamentos em ordens de serviço
- Controlar status (pendente, aprovado, rejeitado)

**SERVIÇOS:**
- Cadastrar diferentes tipos de serviços (manutenção, reparo, troca de óleo, etc.)
- Definir preços e descrições para cada serviço
- Categorizar serviços por tipo
- Controle de tempo estimado para execução

**PRODUTOS:**
- Cadastrar produtos e peças
- Controle de estoque (entrada, saída, estoque mínimo)
- Preços de compra e venda
- Fornecedores associados
- Categorização de produtos

**AGENDAMENTOS:**
- Agendar serviços para datas específicas
- Controle de horários disponíveis
- Associar cliente, veículo e serviço ao agendamento
- Status do agendamento (agendado, em andamento, concluído)

**FORNECEDORES:**
- Cadastrar fornecedores de peças e produtos
- Informações de contato e documentação
- Histórico de compras

**CATEGORIAS:**
- Organizar produtos e serviços em categorias
- Facilitar a busca e organização

**RELATÓRIOS:**
- Relatórios de vendas por período
- Relatórios de estoque
- Relatórios de serviços realizados
- Análise de faturamento

**IA PARA DIAGNÓSTICO:**
- Análise de sintomas de veículos usando inteligência artificial
- Sugestões de possíveis causas de problemas

**PERFIL DA OFICINA:**
- Configurar dados da empresa
- Upload de logo
- Informações de contato

COMO RESPONDER:
- Seja direto e prático
- Use exemplos específicos do sistema
- Mencione onde encontrar cada funcionalidade no menu
- Se não souber algo específico, oriente a entrar em contato com o suporte
- Mantenha respostas concisas mas completas

Exemplos de navegação:
- Dashboard: visão geral com estatísticas
- Menu Clientes: para gerenciar clientes
- Menu Produtos: para controle de estoque  
- Menu Serviços: para cadastrar tipos de serviço
- Menu Orçamentos: para criar propostas
- Menu Agendamentos: para controlar agenda
- Menu Relatórios: para análises e relatórios`
    }

    console.log('Fazendo chamada para OpenAI...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    console.log('Status da resposta OpenAI:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro da OpenAI:', errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Resposta da OpenAI recebida')
    
    const aiResponse = data.choices[0].message.content

    if (type === 'diagnostico') {
      // Dividir a resposta em causas individuais
      const causes = aiResponse.split('\n').filter((line: string) => line.trim().length > 0)
      const result = { 
        success: true, 
        causes: causes 
      }
      console.log('Retornando resultado de diagnóstico:', result)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      const result = { 
        success: true, 
        answer: aiResponse 
      }
      console.log('Retornando resultado de suporte:', result)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error in ai-assistant function:', error)
    const errorResponse = { 
      success: false, 
      error: error.message || 'Erro interno do servidor'
    }
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
