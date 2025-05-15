
import { z } from 'zod';
import { formSchema } from '@/components/admin/auth/LoginForm';

export type FormValues = z.infer<typeof formSchema>;
