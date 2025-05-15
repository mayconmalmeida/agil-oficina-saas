export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nome: string
          telefone: string
          user_id: string | null
          veiculo: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone: string
          user_id?: string | null
          veiculo: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string
          user_id?: string | null
          veiculo?: string
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
      profiles: {
        Row: {
          cep: string | null
          cidade: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          full_name: string | null
          id: string
          nome_oficina: string | null
          plano: string | null
          telefone: string | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          full_name?: string | null
          id: string
          nome_oficina?: string | null
          plano?: string | null
          telefone?: string | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          full_name?: string | null
          id?: string
          nome_oficina?: string | null
          plano?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          tipo: string
          user_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
          user_id?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
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
          id?: string
          payment_method?: string | null
          plan?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_budget: {
        Args: {
          p_user_id: string
          p_cliente: string
          p_veiculo: string
          p_descricao: string
          p_valor_total: number
        }
        Returns: undefined
      }
      create_client: {
        Args: {
          p_user_id: string
          p_nome: string
          p_telefone: string
          p_email: string
          p_veiculo: string
        }
        Returns: undefined
      }
      create_profile: {
        Args: { user_id: string; user_email: string; user_full_name: string }
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
          p_user_id: string
          p_nome: string
          p_tipo: string
          p_valor: number
          p_descricao: string
        }
        Returns: undefined
      }
      create_subscription: {
        Args: {
          user_id: string
          plan_type: string
          start_date: string
          end_date: string
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
      update_onboarding_step: {
        Args: { step: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
