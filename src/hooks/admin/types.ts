
import { z } from 'zod';
import { formSchema } from '@/components/admin/auth/LoginForm';

export type FormValues = z.infer<typeof formSchema>;

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  is_superadmin?: boolean;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  expires_at: string;
}

export interface DatabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}

// Add any other admin-related types here
