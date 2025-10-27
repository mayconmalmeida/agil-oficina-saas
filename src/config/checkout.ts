export const CHECKOUT_PROVIDER = import.meta.env.VITE_CHECKOUT_PROVIDER?.toLowerCase() || 'cakto';

// Asaas hosted checkout/payment links
export const ASAAS_MONTHLY_URL = import.meta.env.VITE_ASAAS_MONTHLY_URL || '';
export const ASAAS_ANNUAL_URL = import.meta.env.VITE_ASAAS_ANNUAL_URL || '';

// Optional context to enrich checkout URLs
interface CheckoutContext {
  userId?: string;
  email?: string;
}

// Helper: pick URL by billing cycle and append context for Asaas
export const getCheckoutUrl = (
  billingCycle: 'mensal' | 'anual',
  fallback?: string,
  ctx?: CheckoutContext
) => {
  if (CHECKOUT_PROVIDER === 'asaas') {
    const base = billingCycle === 'mensal' ? ASAAS_MONTHLY_URL : ASAAS_ANNUAL_URL;
    if (base) {
      try {
        const url = new URL(base);
        // Append best-effort hints; Asaas may ignore unknown params but won't break the link
        if (ctx?.userId) url.searchParams.set('externalReference', ctx.userId);
        if (ctx?.email) url.searchParams.set('customer_email', ctx.email);
        return url.toString();
      } catch (e) {
        // If base is not a valid absolute URL, return as-is
        return base;
      }
    }
  }
  return fallback || '';
};