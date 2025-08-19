
export interface Agendamento {
  id: string;
  user_id: string;
  data_agendamento: string;
  horario: string;
  cliente_id?: string;
  veiculo_id?: string;
  servico_id?: string;
  observacoes?: string;
  status: string;
  created_at: string;
  updated_at: string;
  clients?: {
    nome: string;
    telefone: string;
    veiculo: string;
  };
  services?: {
    nome: string;
    tipo: string;
    valor: number;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Agendamento;
}
