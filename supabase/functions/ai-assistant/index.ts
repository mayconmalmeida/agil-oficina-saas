
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
      systemPrompt = `Você é um assistente de suporte para um sistema de gestão de oficinas mecânicas.
      Ajude os usuários com dúvidas sobre o uso da plataforma, funcionalidades do sistema, navegação, 
      cadastros, relatórios e outras questões relacionadas ao software.
      Seja conciso, direto e útil. Se não souber algo específico, oriente o usuário a entrar em contato com o suporte técnico.`
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
