import { supabase } from '@/lib/supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

interface QueryOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  fallbackData?: any;
  cacheKey?: string;
}

interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  fromCache: boolean;
  fromFallback: boolean;
}

class QueryService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TIMEOUT = 10000; // 10 segundos
  private readonly DEFAULT_RETRIES = 2;
  private readonly DEFAULT_RETRY_DELAY = 1000; // 1 segundo
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Executa uma consulta com timeout, retry e cache
   */
  async executeQuery<T>(
    queryBuilder: () => any,
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.DEFAULT_RETRIES,
      retryDelay = this.DEFAULT_RETRY_DELAY,
      fallbackData = null,
      cacheKey
    } = options;

    // Verificar cache primeiro
    if (cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`[QueryService] Dados obtidos do cache: ${cacheKey}`);
        return {
          data: cached,
          error: null,
          fromCache: true,
          fromFallback: false
        };
      }
    }

    let lastError: Error | null = null;

    // Tentar executar a consulta com retry
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[QueryService] Tentativa ${attempt + 1}/${retries + 1}`);
        
        const result = await this.executeWithTimeout(queryBuilder(), timeout);
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        // Salvar no cache se bem-sucedido
        if (cacheKey && result.data) {
          this.setCache(cacheKey, result.data);
        }

        return {
          data: result.data,
          error: null,
          fromCache: false,
          fromFallback: false
        };

      } catch (error: any) {
        lastError = error;
        console.error(`[QueryService] Erro na tentativa ${attempt + 1}:`, error.message);

        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt); // Backoff exponencial
          console.log(`[QueryService] Aguardando ${delay}ms antes da próxima tentativa...`);
          await this.sleep(delay);
        }
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    console.error(`[QueryService] Todas as tentativas falharam. Usando fallback.`);

    return {
      data: fallbackData,
      error: lastError,
      fromCache: false,
      fromFallback: fallbackData !== null
    };
  }

  /**
   * Executa uma consulta com timeout
   */
  private async executeWithTimeout(query: any, timeout: number) {
    return new Promise<any>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout na consulta (${timeout}ms)`));
      }, timeout);

      query
        .then((result: any) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error: any) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Métodos específicos para diferentes tipos de consulta
   */

  // Consultas de orçamentos
  async fetchBudgets(userId: string, filters?: { status?: string }) {
    return this.executeQuery(
      () => {
        let query = supabase
          .from('orcamentos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'todos') {
          query = query.eq('status', filters.status);
        }

        return query;
      },
      {
        cacheKey: `budgets_${userId}_${filters?.status || 'all'}`,
        fallbackData: []
      }
    );
  }

  // Consulta de orçamento específico
  async fetchBudget(budgetId: string, userId?: string) {
    return this.executeQuery(
      () => {
        let query = supabase
          .from('orcamentos')
          .select('*')
          .eq('id', budgetId);
        
        // Adicionar filtro de user_id apenas se fornecido
        if (userId) {
          query = query.eq('user_id', userId);
        }
        
        return query.single();
      },
      {
        cacheKey: `budget_${budgetId}`,
        fallbackData: null
      }
    );
  }

  // Consultas de clientes
  async fetchClients(userId: string) {
    return this.executeQuery(
      () => supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('nome'),
      {
        cacheKey: `clients_${userId}`,
        fallbackData: []
      }
    );
  }

  // Consultas de serviços
  async fetchServices(userId: string) {
    return this.executeQuery(
      () => supabase
        .from('services')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('nome'),
      {
        cacheKey: `services_${userId}`,
        fallbackData: []
      }
    );
  }

  // Consultas de ordens de serviço
  async fetchOrders(userId: string) {
    return this.executeQuery(
      () => supabase
        .from('ordens_servico')
        .select(`
          *,
          clients (
            nome,
            telefone
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      {
        cacheKey: `orders_${userId}`,
        fallbackData: []
      }
    );
  }

  /**
   * Métodos de cache
   */
  private getFromCache(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Limpar cache
   */
  clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Utilitários
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verificar status da conexão
   */
  async checkConnection(): Promise<boolean> {
    try {
      const result = await this.executeWithTimeout(
        supabase.from('plan_configurations').select('id').limit(1),
        5000
      );
      return !result.error;
    } catch {
      return false;
    }
  }
}

// Instância singleton
export const queryService = new QueryService();
export default queryService;