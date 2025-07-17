
export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'essencial_mensal' | 'essencial_anual' | 'premium_mensal' | 'premium_anual' | 'free_trial_essencial' | 'free_trial_premium';
  status: 'active' | 'trialing' | 'cancelled' | 'expired';
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  is_manual: boolean | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRPCResponse {
  success: boolean;
  error?: string;
  has_subscription: boolean;
  subscription?: UserSubscription;
}

export interface PlanDetails {
  name: string;
  type: 'essencial' | 'premium';
  billing: 'mensal' | 'anual' | 'trial';
  price: string;
  features: string[];
}

export interface SubscriptionStatus {
  hasSubscription: boolean;
  subscription: UserSubscription | null;
  isTrialActive: boolean;
  isPaidActive: boolean;
  canAccessFeatures: boolean;
  isPremium: boolean;
  isEssencial: boolean;
  daysRemaining: number;
  planDetails: PlanDetails | null;
}
