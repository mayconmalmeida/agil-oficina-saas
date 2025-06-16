
import { Service } from './supabaseTypes';

export interface ServiceWithStock extends Service {
  codigo?: string;
  quantidade_estoque?: number;
  preco_custo?: number;
}
