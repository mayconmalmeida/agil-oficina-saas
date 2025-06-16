
import { z } from 'zod';

export const profileSchema = z.object({
  nome_oficina: z.string().min(1, { message: "Nome da oficina é obrigatório" }),
  telefone: z.string().min(8, { message: "Telefone inválido" }),
  email: z.string().email({ message: "Email inválido" }).optional(),
  cnpj: z.string().optional(),
  responsavel: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  logo_url: z.string().optional(),
  whatsapp_suporte: z.string().optional(),
  full_name: z.string().optional(),
  notify_new_client: z.boolean().optional().default(true),
  notify_approved_budget: z.boolean().optional().default(true),
  notify_by_email: z.boolean().optional().default(false),
  sound_enabled: z.boolean().optional().default(false),
});

// Export the type for use in components
export type ProfileFormValues = z.infer<typeof profileSchema>;
