import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

// Helper: extract deeply nested value safely
const get = (obj: any, path: string, defaultValue?: any) => {
  try {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Map Asaas event to internal subscription status
const mapEventToStatus = (event: string): 'active' | 'expired' | 'cancelled' | 'trialing' => {
  const e = (event || '').toUpperCase();
  if (e.includes('PAYMENT_RECEIVED') || e.includes('PAYMENT_CONFIRMED') || e.includes('SUBSCRIPTION_PAYMENT')) {
    return 'active';
  }
  if (e.includes('PAYMENT_OVERDUE') || e.includes('PAYMENT_DELINQUENT')) {
    return 'expired'; // bloqueio no mesmo dia
  }
  if (e.includes('SUBSCRIPTION_CANCELLED') || e.includes('PAYMENT_REFUNDED') || e.includes('SUBSCRIPTION_DELETED')) {
    return 'cancelled';
  }
  if (e.includes('SUBSCRIPTION_CREATED') || e.includes('PAYMENT_PENDING')) {
    return 'trialing';
  }
  return 'expired';
};

// Guess plan_type based on cycle or product name
const mapCycleToPlanType = (cycle?: string, productName?: string): string => {
  const c = (cycle || '').toLowerCase();
  const name = (productName || '').toLowerCase();
  const isPremium = name.includes('premium') || name.includes('oficinago') || name.includes('plano');
  const mensal = c.includes('month') || c.includes('mensal');
  const anual = c.includes('year') || c.includes('anual');
  if (anual) return 'premium_anual';
  if (mensal) return 'premium_mensal';
  // fallback
  return 'premium_mensal';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get("token");

    const authHeader = req.headers.get("authorization") || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;
    const headerToken = req.headers.get("x-webhook-token");

    const expectedToken = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

    if (expectedToken) {
      const providedToken = bearerToken || headerToken || tokenParam;
      if (!providedToken || providedToken !== expectedToken) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Parse body
    const contentType = req.headers.get("content-type") || "";
    let body: any = null;
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = { raw: text };
      }
    }

    // Extract event type
    const eventType = body?.event || body?.type || get(body, 'eventName') || "unknown";
    console.log("[asaas-webhook] Event received:", eventType);

    // Try to resolve user_id using multiple hints
    const externalRef = get(body, 'payment.externalReference') || get(body, 'externalReference');
    const metadataUserId = get(body, 'metadata.user_id') || get(body, 'payment.metadata.user_id') || get(body, 'subscription.metadata.user_id');
    let userId: string | null = null;

    if (externalRef) {
      userId = String(externalRef);
    } else if (metadataUserId) {
      userId = String(metadataUserId);
    } else {
      // Try by email from common locations
      const email = get(body, 'payment.customer.email') || get(body, 'subscription.customer.email') || get(body, 'customer.email') || get(body, 'customer_email') || get(body, 'payer.email');
      if (email) {
        // Lookup profiles by email first (faster than auth list)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (profile?.id) {
          userId = profile.id;
        } else {
          // Fallback: list users
          const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
          if (!listErr && users?.users?.length) {
            const found = users.users.find(u => u.email === email);
            userId = found?.id || null;
          }
        }
      }
    }

    if (!userId) {
      console.warn('[asaas-webhook] Could not resolve user_id from webhook');
      return new Response(JSON.stringify({ success: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine subscription cycle and plan type
    const cycle = get(body, 'subscription.cycle') || get(body, 'payment.subscription.cycle') || get(body, 'billingCycle');
    const productName = get(body, 'payment.description') || get(body, 'subscription.description') || get(body, 'productName');
    const planType = mapCycleToPlanType(cycle, productName);

    // Map event to status
    const status = mapEventToStatus(eventType);

    // Compute period end
    const now = new Date();
    let endsAt: string | null = null;
    if (status === 'active') {
      if ((cycle || '').toLowerCase().includes('year') || (cycle || '').toLowerCase().includes('anual')) {
        const end = new Date(now);
        end.setFullYear(end.getFullYear() + 1);
        endsAt = end.toISOString();
      } else {
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);
        endsAt = end.toISOString();
      }
    } else if (status === 'expired' || status === 'cancelled') {
      endsAt = now.toISOString();
    }

    // Upsert subscription for user
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_type: planType,
        status: status,
        starts_at: status === 'active' ? now.toISOString() : null,
        ends_at: endsAt,
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id' });

    if (subError) {
      console.error('[asaas-webhook] Error upserting subscription:', subError);
    }

    // Log transaction for audit
    const amount = get(body, 'payment.value') || get(body, 'amount') || 0;
    const transactionId = get(body, 'payment.id') || get(body, 'id') || `asaas_${Date.now()}`;

    const { error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        transaction_id: String(transactionId),
        amount: Number(amount) || 0,
        currency: 'BRL',
        status: status,
        plan_type: planType,
        payment_method: 'asaas',
        metadata: body,
        created_at: now.toISOString()
      });

    if (txError) {
      console.error('[asaas-webhook] Error recording transaction:', txError);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[asaas-webhook] Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});