
import { Workshop } from '@/components/admin/UsersTable';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';

// Define the subscription type
export type Subscription = {
  status?: string;
  ends_at?: string;
  started_at?: string;
};

export type EditFormData = {
  nome_oficina: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
};
