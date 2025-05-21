
export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export interface Budget {
  id: string;
  numero?: string;
  cliente: string;
  veiculo: string;
  data: string;
  valor: number;
  status: string;
  itens?: number;
}

export interface BudgetResponse {
  id: string;
  cliente: string;
  veiculo: string;
  created_at: string;
  valor_total: number;
  status: string | null;
  descricao: string;
  user_id: string | null;
  itens_count?: number;
}

// Mock data for when API data is not available
export const mockBudgets: Budget[] = [
  {
    id: "1",
    numero: "ORC-2023-001",
    cliente: "João Silva",
    veiculo: "Toyota Corolla 2020",
    data: "2023-05-12",
    valor: 850.0,
    status: "pendente",
    itens: 3
  },
  {
    id: "2",
    numero: "ORC-2023-002",
    cliente: "Maria Oliveira",
    veiculo: "Honda Civic 2019",
    data: "2023-05-15",
    valor: 1250.0,
    status: "aprovado",
    itens: 5
  },
  {
    id: "3",
    numero: "ORC-2023-003",
    cliente: "Carlos Pereira",
    veiculo: "Volkswagen Golf 2021",
    data: "2023-05-20",
    valor: 540.0,
    status: "rejeitado",
    itens: 2
  },
  {
    id: "4",
    numero: "ORC-2023-004",
    cliente: "Ana Santos",
    veiculo: "Fiat Uno 2018",
    data: "2023-05-22",
    valor: 380.0,
    status: "pendente",
    itens: 2
  },
  {
    id: "5",
    numero: "ORC-2023-005",
    cliente: "Paulo Souza",
    veiculo: "Chevrolet Onix 2022",
    data: "2023-05-25",
    valor: 1450.0,
    status: "convertido",
    itens: 7
  },
];
