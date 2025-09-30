// Deno type definitions for Supabase Edge Functions
declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

// Deno module declarations for HTTP imports
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/stripe@14.21.0" {
  class Stripe {
    constructor(secretKey: string, options?: any);
    webhooks: {
      constructEvent(payload: string | Buffer, signature: string, secret: string): any;
      constructEventAsync(payload: string | Buffer, signature: string, secret: string): Promise<any>;
    };
    subscriptions: {
      retrieve(id: string): Promise<any>;
      update(id: string, params: any): Promise<any>;
      list(params: any): Promise<any>;
    };
    customers: {
      retrieve(id: string): Promise<any>;
      list(params: any): Promise<any>;
      create(params: any): Promise<any>;
    };
    prices: {
      retrieve(id: string): Promise<any>;
    };
    checkout: {
      sessions: {
        create(params: any): Promise<any>;
      };
    };
    billingPortal: {
      sessions: {
        create(params: any): Promise<any>;
      };
    };
  }
  
  namespace Stripe {
    namespace Checkout {
      interface Session {
        id: string;
        customer: string;
        subscription: string;
        mode: string;
        metadata: any;
      }
    }
    
    interface Subscription {
      id: string;
      customer: string;
      status: string;
      items: any;
      metadata: any;
      current_period_end: number;
    }
  }
  
  export = Stripe;
}

declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  export function createClient(url: string, key: string, options?: any): any;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string, options?: any): any;
}

declare module "https://deno.land/x/cors@v1.2.2/mod.ts" {
  export function cors(options?: any): (request: Request) => Response | null;
}