
export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialingUsers: number;
  totalRevenue: number;
  newUsersThisMonth: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  isAdmin: true;
  canAccessFeatures: true;
}

export interface AdminAuthState {
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
}

export type AdminRole = 'admin' | 'superadmin';

export interface AdminContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  checkAdminPermissions: (requiredRole?: AdminRole) => boolean;
  signOut: () => Promise<void>;
}
