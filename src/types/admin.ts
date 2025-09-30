
export interface AdminStats {
  totalOficinas: number;
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
  sessionToken?: string;
  expiresAt?: string;
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
  loginAdmin: (email: string, password: string) => Promise<boolean>;
}

// Novo tipo para a tabela admins do banco
export interface AdminRecord {
  id: string;
  email: string;
  password_hash: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// Tipo para validação de login
export interface AdminLoginResult {
  success: boolean;
  admin?: {
    id: string;
    email: string;
    role: AdminRole;
    is_active: boolean;
  };
  error?: string;
}
