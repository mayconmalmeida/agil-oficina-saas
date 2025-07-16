
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan_type, user_id } = await req.json();
    
    if (!plan_type || !user_id) {
      throw new Error("plan_type e user_id são obrigatórios");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Buscar configuração do plano
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const planTypeOnly = plan_type.replace('_anual', '').replace('_mensal', '');
    const billingCycle = plan_type.includes('_anual') ? 'anual' : 'mensal';
    
    const { data: planConfig, error: planError } = await supabase
      .from('plan_configurations')
      .select('*')
      .eq('plan_type', planTypeOnly)
      .eq('billing_cycle', billingCycle)
      .eq('is_active', true)
      .single();

    if (planError || !planConfig) {
      throw new Error(`Configuração do plano não encontrada: ${plan_type}`);
    }

    // Buscar dados do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, nome_oficina')
      .eq('id', user_id)
      .single();

    if (profileError || !profile?.email) {
      throw new Error("Usuário não encontrado ou sem email");
    }

    // Verificar se já existe customer no Stripe
    const customers = await stripe.customers.list({
      email: profile.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.nome_oficina || profile.email,
      });
      customerId = customer.id;
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: planConfig.currency || 'brl',
            product_data: {
              name: planConfig.name,
            },
            unit_amount: Math.round(planConfig.price * 100), // Converter para centavos
            recurring: {
              interval: billingCycle === 'anual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/admin/subscriptions?success=true`,
      cancel_url: `${req.headers.get("origin")}/admin/subscriptions?canceled=true`,
      metadata: {
        user_id: user_id,
        plan_type: plan_type,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao criar checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
