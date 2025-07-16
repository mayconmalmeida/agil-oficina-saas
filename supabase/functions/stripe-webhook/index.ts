
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === "subscription" && session.metadata?.user_id) {
          const { error } = await supabase.rpc('update_subscription_after_payment', {
            p_user_id: session.metadata.user_id,
            p_plan_type: session.metadata.plan_type,
            p_stripe_customer_id: session.customer as string,
            p_stripe_subscription_id: session.subscription as string
          });

          if (error) {
            console.error("Erro ao atualizar assinatura:", error);
          } else {
            console.log("Assinatura atualizada com sucesso");
          }
        }
        break;
      }
      
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Buscar user_id pelo stripe_customer_id
        const { data: userSub, error: userSubError } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (!userSubError && userSub) {
          const status = subscription.status === 'active' ? 'active' : 
                        subscription.status === 'canceled' ? 'cancelled' : 
                        subscription.status;

          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              status: status,
              ends_at: subscription.current_period_end ? 
                       new Date(subscription.current_period_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error("Erro ao atualizar status da assinatura:", error);
          }
        }
        break;
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
