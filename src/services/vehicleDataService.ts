
// Simulação de API para busca de dados do veículo pela placa
// Em produção, você conectaria com uma API real como FIPE ou similar

interface VehicleData {
  marca: string;
  modelo: string;
  ano: string;
}

// Base de dados simulada de veículos
const vehicleDatabase: Record<string, VehicleData> = {
  'ABC1234': { marca: 'Toyota', modelo: 'Corolla', ano: '2020' },
  'DEF5678': { marca: 'Honda', modelo: 'Civic', ano: '2019' },
  'GHI9012': { marca: 'Ford', modelo: 'Ka', ano: '2021' },
  'JKL3456': { marca: 'Chevrolet', modelo: 'Onix', ano: '2022' },
  'MNO7890': { marca: 'Volkswagen', modelo: 'Gol', ano: '2020' },
  'PQR1357': { marca: 'Fiat', modelo: 'Uno', ano: '2018' },
  'STU2468': { marca: 'Nissan', modelo: 'March', ano: '2019' },
  'VWX9753': { marca: 'Hyundai', modelo: 'HB20', ano: '2021' },
  'YZA1122': { marca: 'Renault', modelo: 'Sandero', ano: '2020' },
  'BCD3344': { marca: 'Peugeot', modelo: '208', ano: '2022' }
};

export const searchVehicleByPlate = async (plate: string): Promise<VehicleData | null> => {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Remove formatação da placa para busca
  const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Busca na base simulada
  const vehicleData = vehicleDatabase[cleanPlate];
  
  if (vehicleData) {
    return vehicleData;
  }
  
  // Se não encontrar na base simulada, gera dados aleatórios
  // (simulando uma API que sempre retorna algo)
  const marcas = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 'Fiat', 'Nissan', 'Hyundai'];
  const modelos = ['Sedan', 'Hatch', 'SUV', 'Crossover'];
  const anos = ['2018', '2019', '2020', '2021', '2022', '2023'];
  
  return {
    marca: marcas[Math.floor(Math.random() * marcas.length)],
    modelo: modelos[Math.floor(Math.random() * modelos.length)],
    ano: anos[Math.floor(Math.random() * anos.length)]
  };
};
