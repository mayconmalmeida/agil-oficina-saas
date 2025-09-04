import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  to: string;
  message: string;
  from_user: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message, from_user }: WhatsAppRequest = await req.json();

    console.log('Enviando mensagem WhatsApp:', { to, from_user, message: message.substring(0, 100) + '...' });

    // Para demo, vamos apenas simular o envio e retornar sucesso
    // Em produção, aqui você integraria com uma API do WhatsApp como:
    // - WhatsApp Business API
    // - Evolution API  
    // - Baileys (WhatsApp Web API)
    
    const response = {
      success: true,
      message_id: `msg_${Date.now()}`,
      to: to,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    console.log('Mensagem enviada com sucesso:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);