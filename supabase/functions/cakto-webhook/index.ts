
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cakto-signature',
}

// Chave secreta do Cakto para validação do webhook
const CAKTO_SECRET_KEY = '69f9efc6-0d22-4b91-9542-23720a5cb0d7';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar assinatura do webhook (opcional, mas recomendado)
    const signature = req.headers.get('x-cakto-signature');
    if (signature && signature !== CAKTO_SECRET_KEY) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body = await req.json();
    console.log('Cakto webhook received:', body);

    // Validar dados necessários do webhook
    const { user_email, plan_type, status, transaction_id, amount, product_id } = body;

    if (!user_email || !plan_type || !status) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: user_email, plan_type, status' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar usuário pelo email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return new Response(
        JSON.stringify({ error: 'Error fetching user data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const user = userData.users.find(u => u.email === user_email);
    
    if (!user) {
      console.error('User not found:', user_email);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mapear status da Cakto para nosso sistema
    let subscriptionStatus = 'active';
    if (status === 'paid' || status === 'completed' || status === 'approved') {
      subscriptionStatus = 'active';
    } else if (status === 'cancelled' || status === 'refunded') {
      subscriptionStatus = 'cancelled';
    } else if (status === 'expired') {
      subscriptionStatus = 'expired';
    } else if (status === 'pending') {
      subscriptionStatus = 'trialing';
    }

    // Mapear product_id para plan_type se necessário
    let finalPlanType = plan_type;
    if (product_id) {
      // Mapear IDs dos produtos Cakto para tipos de plano
      const productMapping: { [key: string]: string } = {
        // Adicionar mapeamentos conforme necessário
        'cakto_premium_mensal': 'premium_mensal',
        'cakto_premium_anual': 'premium_anual',
        'cakto_essencial_mensal': 'essencial_mensal',
        'cakto_essencial_anual': 'essencial_anual'
      };
      
      if (productMapping[product_id]) {
        finalPlanType = productMapping[product_id];
      }
    }

    // Validar plan_type
    const validPlanTypes = [
      'essencial_mensal', 
      'essencial_anual', 
      'premium_mensal', 
      'premium_anual'
    ];

    if (!validPlanTypes.includes(finalPlanType)) {
      return new Response(
        JSON.stringify({ error: `Invalid plan_type: ${finalPlanType}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Atualizar assinatura apenas se o pagamento foi bem-sucedido
    if (subscriptionStatus === 'active') {
      const { data: updateResult, error: updateError } = await supabase.rpc(
        'update_subscription_after_payment',
        {
          p_user_id: user.id,
          p_plan_type: finalPlanType
        }
      );

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error updating subscription' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Subscription updated successfully:', updateResult);
    } else {
      // Para status cancelled/expired, atualizar o status da assinatura
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: subscriptionStatus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating subscription status:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error updating subscription status' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Subscription status updated to:', subscriptionStatus);
    }

    // Registrar transação para auditoria
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert([
        {
          user_id: user.id,
          transaction_id: transaction_id || `cakto_${Date.now()}`,
          amount: amount || 0,
          currency: 'BRL',
          status: subscriptionStatus,
          plan_type: finalPlanType,
          payment_method: 'cakto',
          metadata: {
            product_id,
            original_status: status,
            webhook_data: body
          }
        }
      ]);

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      // Não falhar o webhook por erro de auditoria
    }

    // Log da transação para auditoria
    console.log('Payment processed:', {
      user_id: user.id,
      user_email,
      plan_type: finalPlanType,
      status: subscriptionStatus,
      transaction_id,
      amount
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        user_id: user.id,
        plan_type: finalPlanType,
        status: subscriptionStatus,
        transaction_id: transaction_id || `cakto_${Date.now()}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
