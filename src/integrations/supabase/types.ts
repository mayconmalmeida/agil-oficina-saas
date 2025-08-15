export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_agendamento: string
          data_hora: string | null
          descricao_servico: string | null
          horario: string
          id: string
          observacoes: string | null
          oficina_id: string | null
          servico_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_agendamento: string
          data_hora?: string | null
          descricao_servico?: string | null
          horario: string
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          servico_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_agendamento?: string
          data_hora?: string | null
          descricao_servico?: string | null
          horario?: string
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          servico_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      campanhas_marketing: {
        Row: {
          arquivo_url: string | null
          clientes_ids: string[] | null
          created_at: string | null
          data_agendada: string
          id: string
          mensagem: string
          oficina_id: string | null
          status: string | null
          tipo_arquivo: string | null
          tipo_envio: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arquivo_url?: string | null
          clientes_ids?: string[] | null
          created_at?: string | null
          data_agendada: string
          id?: string
          mensagem: string
          oficina_id?: string | null
          status?: string | null
          tipo_arquivo?: string | null
          tipo_envio: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arquivo_url?: string | null
          clientes_ids?: string[] | null
          created_at?: string | null
          data_agendada?: string
          id?: string
          mensagem?: string
          oficina_id?: string | null
          status?: string | null
          tipo_arquivo?: string | null
          tipo_envio?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_marketing_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          ano: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cor: string | null
          created_at: string | null
          documento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          is_active: boolean | null
          kilometragem: string | null
          marca: string | null
          modelo: string | null
          nome: string
          numero: string | null
          oficina_id: string | null
          placa: string | null
          telefone: string
          tipo: string | null
          user_id: string | null
          veiculo: string
        }
        Insert: {
          ano?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cor?: string | null
          created_at?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          is_active?: boolean | null
          kilometragem?: string | null
          marca?: string | null
          modelo?: string | null
          nome: string
          numero?: string | null
          oficina_id?: string | null
          placa?: string | null
          telefone: string
          tipo?: string | null
          user_id?: string | null
          veiculo: string
        }
        Update: {
          ano?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cor?: string | null
          created_at?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          is_active?: boolean | null
          kilometragem?: string | null
          marca?: string | null
          modelo?: string | null
          nome?: string
          numero?: string | null
          oficina_id?: string | null
          placa?: string | null
          telefone?: string
          tipo?: string | null
          user_id?: string | null
          veiculo?: string
        }
        Relationships: []
      }
      estoque: {
        Row: {
          codigo_produto: string | null
          created_at: string | null
          id: string
          produto_id: string | null
          quantidade: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          codigo_produto?: string | null
          created_at?: string | null
          id?: string
          produto_id?: string | null
          quantidade?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          codigo_produto?: string | null
          created_at?: string | null
          id?: string
          produto_id?: string | null
          quantidade?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          oficina_id: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          oficina_id?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          oficina_id?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      ia_suporte_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_bot: boolean
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_bot?: boolean
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_bot?: boolean
          user_id?: string
        }
        Relationships: []
      }
      notas_fiscais: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_emissao: string
          fornecedor_id: string | null
          id: string
          numero: string
          status: string | null
          tipo: string
          updated_at: string | null
          user_id: string
          valor_total: number
          xml_url: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_emissao: string
          fornecedor_id?: string | null
          id?: string
          numero: string
          status?: string | null
          tipo: string
          updated_at?: string | null
          user_id: string
          valor_total: number
          xml_url?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_emissao?: string
          fornecedor_id?: string | null
          id?: string
          numero?: string
          status?: string | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
          valor_total?: number
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      oficinas: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          nome_oficina: string | null
          plano: string | null
          responsavel: string | null
          telefone: string | null
          trial_ends_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          nome_oficina?: string | null
          plano?: string | null
          responsavel?: string | null
          telefone?: string | null
          trial_ends_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          nome_oficina?: string | null
          plano?: string | null
          responsavel?: string | null
          telefone?: string | null
          trial_ends_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_status: {
        Row: {
          budget_created: boolean | null
          clients_added: boolean | null
          profile_completed: boolean | null
          services_added: boolean | null
          user_id: string
        }
        Insert: {
          budget_created?: boolean | null
          clients_added?: boolean | null
          profile_completed?: boolean | null
          services_added?: boolean | null
          user_id: string
        }
        Update: {
          budget_created?: boolean | null
          clients_added?: boolean | null
          profile_completed?: boolean | null
          services_added?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente: string
          created_at: string | null
          descricao: string
          id: string
          status: string | null
          user_id: string | null
          valor_total: number
          veiculo: string
        }
        Insert: {
          cliente: string
          created_at?: string | null
          descricao: string
          id?: string
          status?: string | null
          user_id?: string | null
          valor_total: number
          veiculo: string
        }
        Update: {
          cliente?: string
          created_at?: string | null
          descricao?: string
          id?: string
          status?: string | null
          user_id?: string | null
          valor_total?: number
          veiculo?: string
        }
        Relationships: []
      }
      ordem_servico_itens: {
        Row: {
          created_at: string | null
          id: string
          nome_item: string
          ordem_servico_id: string
          quantidade: number | null
          servico_id: string | null
          tipo: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome_item: string
          ordem_servico_id: string
          quantidade?: number | null
          servico_id?: string | null
          tipo: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string | null
          id?: string
          nome_item?: string
          ordem_servico_id?: string
          quantidade?: number | null
          servico_id?: string | null
          tipo?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordem_servico_itens_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_servico_itens_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          observacoes: string | null
          oficina_id: string | null
          orcamento_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          valor_total: number | null
          veiculo_id: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          orcamento_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          valor_total?: number | null
          veiculo_id?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          orcamento_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          valor_total?: number | null
          veiculo_id?: string | null
        }
        Relationships: []
      }
      plan_configurations: {
        Row: {
          affiliate_link: string | null
          billing_cycle: string
          created_at: string | null
          currency: string | null
          display_order: number | null
          features: Json
          id: string
          is_active: boolean | null
          name: string
          plan_type: string
          price: number
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          billing_cycle: string
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          features?: Json
          id?: string
          is_active?: boolean | null
          name: string
          plan_type: string
          price: number
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          billing_cycle?: string
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          features?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          plan_type?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          documents: Json | null
          email: string | null
          endereco: string | null
          estado: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          nome_oficina: string | null
          oficina_id: string | null
          plano: string | null
          responsavel: string | null
          role: string | null
          telefone: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          whatsapp_suporte: string | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          logo_url?: string | null
          nome_oficina?: string | null
          oficina_id?: string | null
          plano?: string | null
          responsavel?: string | null
          role?: string | null
          telefone?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          whatsapp_suporte?: string | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          nome_oficina?: string | null
          oficina_id?: string | null
          plano?: string | null
          responsavel?: string | null
          role?: string | null
          telefone?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          whatsapp_suporte?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_oficina_id"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          codigo: string | null
          created_at: string | null
          descricao: string | null
          id: string
          is_active: boolean | null
          nome: string
          preco_custo: number | null
          quantidade_estoque: number | null
          tipo: string
          user_id: string | null
          valor: number
        }
        Insert: {
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          is_active?: boolean | null
          nome: string
          preco_custo?: number | null
          quantidade_estoque?: number | null
          tipo: string
          user_id?: string | null
          valor: number
        }
        Update: {
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          is_active?: boolean | null
          nome?: string
          preco_custo?: number | null
          quantidade_estoque?: number | null
          tipo?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string | null
          ends_at: string | null
          expires_at: string | null
          id: string
          payment_method: string | null
          plan: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          ends_at?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          plan?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          ends_at?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          plan?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          is_manual: boolean | null
          plan_type: string
          starts_at: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_manual?: boolean | null
          plan_type: string
          starts_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_manual?: boolean | null
          plan_type?: string
          starts_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: string
          cliente_id: string
          cor: string | null
          created_at: string
          id: string
          kilometragem: string | null
          marca: string
          modelo: string
          placa: string
          tipo_combustivel: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano: string
          cliente_id: string
          cor?: string | null
          created_at?: string
          id?: string
          kilometragem?: string | null
          marca: string
          modelo: string
          placa: string
          tipo_combustivel?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: string
          cliente_id?: string
          cor?: string | null
          created_at?: string
          id?: string
          kilometragem?: string | null
          marca?: string
          modelo?: string
          placa?: string
          tipo_combustivel?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_agendamento: {
        Args: {
          p_cliente_id: string
          p_data: string
          p_horario: string
          p_observacoes: string
          p_servico_id: string
          p_status: string
          p_user_id: string
          p_veiculo_id: string
        }
        Returns: undefined
      }
      create_agendamentos_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_budget: {
        Args: {
          p_cliente: string
          p_descricao: string
          p_user_id: string
          p_valor_total: number
          p_veiculo: string
        }
        Returns: undefined
      }
      create_client: {
        Args:
          | {
              p_ano: string
              p_email: string
              p_marca: string
              p_modelo: string
              p_nome: string
              p_placa: string
              p_telefone: string
              p_user_id: string
              p_veiculo: string
            }
          | {
              p_email: string
              p_nome: string
              p_telefone: string
              p_user_id: string
              p_veiculo: string
            }
        Returns: undefined
      }
      create_manual_subscription: {
        Args: { p_amount?: number; p_plan_type: string; p_user_id: string }
        Returns: Json
      }
      create_ordem_servico_from_orcamento: {
        Args: {
          p_observacoes?: string
          p_orcamento_id: string
          p_user_id: string
        }
        Returns: string
      }
      create_profile: {
        Args: { user_email: string; user_full_name: string; user_id: string }
        Returns: undefined
      }
      create_profile_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_profiles_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_service: {
        Args: {
          p_descricao: string
          p_nome: string
          p_tipo: string
          p_user_id: string
          p_valor: number
        }
        Returns: undefined
      }
      create_subscription: {
        Args: {
          end_date: string
          plan_type: string
          start_date: string
          user_id: string
        }
        Returns: undefined
      }
      create_subscriptions_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_profiles_table: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      ensure_whatsapp_suporte_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_role: {
        Args: { user_email: string }
        Returns: string
      }
      get_user_oficina_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_subscription: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_trial_active: {
        Args: { user_profile_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      process_nfce_xml: {
        Args: { p_produtos: Json; p_user_id: string }
        Returns: Json
      }
      start_free_trial: {
        Args: { selected_plan_type: string }
        Returns: Json
      }
      update_onboarding_step: {
        Args: { step: string }
        Returns: undefined
      }
      update_subscription_after_payment: {
        Args:
          | {
              p_plan_type: string
              p_stripe_customer_id?: string
              p_stripe_subscription_id?: string
              p_user_id: string
            }
          | { p_plan_type: string; p_user_id: string }
        Returns: Json
      }
      update_user_plan: {
        Args: { new_plan: string; user_profile_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
