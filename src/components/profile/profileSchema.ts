
import { z } from 'zod';

export const profileSchema = z.object({
  nome_oficina: z.string().min(1, { message: "Nome da oficina é obrigatório" }),
  telefone: z.string().min(8, { message: "Telefone inválido" }),
  logo_url: z.string().optional(),
  whatsapp_suporte: z.string().optional(),
});
