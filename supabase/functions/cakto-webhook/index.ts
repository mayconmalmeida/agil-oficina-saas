
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const body = await req.json();
    console.log('Cakto webhook received:', body);

    // Validar dados necessários do webhook
    const { user_email, plan_type, status, transaction_id } = body;

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
    if (status === 'paid' || status === 'completed') {
      subscriptionStatus = 'active';
    } else if (status === 'cancelled' || status === 'refunded') {
      subscriptionStatus = 'cancelled';
    } else if (status === 'expired') {
      subscriptionStatus = 'expired';
    }

    // Validar plan_type
    const validPlanTypes = [
      'essencial_mensal', 
      'essencial_anual', 
      'premium_mensal', 
      'premium_anual'
    ];

    if (!validPlanTypes.includes(plan_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan_type' }),
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
          p_plan_type: plan_type
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

    // Log da transação para auditoria
    console.log('Payment processed:', {
      user_id: user.id,
      user_email,
      plan_type,
      status: subscriptionStatus,
      transaction_id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        user_id: user.id,
        plan_type,
        status: subscriptionStatus
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
