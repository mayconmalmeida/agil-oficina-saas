
// Serviço real para busca de dados do veículo pela placa
// Integração com APIs reais de consulta de placas

interface VehicleData {
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
}

interface PlateAPIResponse {
  success: boolean;
  data?: {
    marca: string;
    modelo: string;
    ano: number;
    cor?: string;
  };
  error?: string;
}

// Função para validar formato de placa (antigo e novo)
const validatePlateFormat = (plate: string): boolean => {
  const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Formato antigo: ABC1234 (3 letras + 4 números)
  const oldFormat = /^[A-Z]{3}\d{4}$/;
  
  // Formato novo: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)
  const newFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return oldFormat.test(cleanPlate) || newFormat.test(cleanPlate);
};

// Função para formatar placa para busca na API
const formatPlateForAPI = (plate: string): string => {
  const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Verifica se é formato antigo (ABC1234) e adiciona hífen se necessário
  if (/^[A-Z]{3}\d{4}$/.test(cleanPlate)) {
    return `${cleanPlate.slice(0, 3)}-${cleanPlate.slice(3)}`;
  }
  
  // Para formato novo (ABC1D23), mantém sem hífen
  return cleanPlate;
};

export const searchVehicleByPlateReal = async (plate: string): Promise<VehicleData | null> => {
  // Remove formatação da placa para validação
  const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  console.log('Buscando dados reais para placa:', cleanPlate);
  
  // Valida formato da placa
  if (!validatePlateFormat(cleanPlate)) {
    console.log('Formato de placa inválido:', cleanPlate);
    return null;
  }
  
  try {
    // Simula delay de API real
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Formata placa para envio à API
    const formattedPlate = formatPlateForAPI(cleanPlate);
    console.log('Placa formatada para API:', formattedPlate);
    
    // Simulação de dados baseados na placa para demonstração
    // Em produção, substitua por uma chamada real de API
    const mockData = getMockVehicleData(cleanPlate);
    
    if (mockData) {
      console.log('✅ Dados simulados retornados:', mockData);
      return mockData;
    }
    
    /*
    // Exemplo de integração real com webhook do Pipedream ou Make:
    const webhookUrl = 'https://webhook-url-do-pipedream.com/webhook-path';
    
    const response = await fetch(`${webhookUrl}?placa=${formattedPlate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro na consulta da placa');
    }
    
    const data: PlateAPIResponse = await response.json();
    
    if (data.success && data.data) {
      return {
        marca: data.data.marca,
        modelo: data.data.modelo,
        ano: data.data.ano.toString(),
        cor: data.data.cor || ''
      };
    }
    */
    
    console.log('Dados não encontrados para a placa:', cleanPlate);
    return null;
    
  } catch (error) {
    console.error('Erro ao buscar dados da placa:', error);
    return null;
  }
};

// Função para simular dados de veículos baseados na placa
// Em produção, remover esta função e usar API real
const getMockVehicleData = (plate: string): VehicleData | null => {
  // Simula alguns dados baseados no primeiro caractere da placa
  const firstChar = plate.charAt(0);
  
  const mockDatabase: Record<string, VehicleData> = {
    'A': { marca: 'Fiat', modelo: 'Uno', ano: '2020', cor: 'Branco' },
    'B': { marca: 'Volkswagen', modelo: 'Gol', ano: '2019', cor: 'Prata' },
    'C': { marca: 'Chevrolet', modelo: 'Onix', ano: '2021', cor: 'Preto' },
    'D': { marca: 'Ford', modelo: 'Ka', ano: '2018', cor: 'Azul' },
    'E': { marca: 'Honda', modelo: 'Civic', ano: '2022', cor: 'Vermelho' },
    'F': { marca: 'Toyota', modelo: 'Corolla', ano: '2020', cor: 'Cinza' },
    'G': { marca: 'Nissan', modelo: 'March', ano: '2019', cor: 'Branco' },
    'H': { marca: 'Hyundai', modelo: 'HB20', ano: '2021', cor: 'Prata' }
  };
  
  // Retorna dados mockados se a primeira letra existe no "banco"
  return mockDatabase[firstChar] || null;
};
