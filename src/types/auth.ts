
import { User, Session } from '@supabase/supabase-js';
import { UserSubscription } from './subscription';

export interface AuthUser extends User {
  role?: string;
  isAdmin?: boolean;
  canAccessFeatures?: boolean;
  subscription?: UserSubscription;
}

export interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isLoadingAuth: boolean;
  role: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

export interface UserProfileData {
  role: string;
  subscription: UserSubscription | null;
}
