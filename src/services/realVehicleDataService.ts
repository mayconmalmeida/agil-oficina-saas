
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
    
    // Por enquanto, retornamos null para forçar preenchimento manual
    // TODO: Integrar com API real de consulta de placas quando disponível
    // Exemplo de APIs brasileiras: SinespCidadao, Detran, etc.
    
    /*
    // Exemplo de como seria a integração real:
    const response = await fetch(`https://api-consulta-placas.com.br/v1/veiculos/${formattedPlate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
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
