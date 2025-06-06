
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
    const { type, message } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    if (type === 'diagnostico') {
      // Dividir a resposta em causas individuais
      const causes = aiResponse.split('\n').filter((line: string) => line.trim().length > 0)
      return new Response(JSON.stringify({ 
        success: true, 
        causes: causes 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({ 
        success: true, 
        answer: aiResponse 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error in ai-assistant function:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
