
import { useState } from 'react';

type ChartData = {
  monthlyRevenue: { month: string; value: number }[];
  topServices: { name: string; value: number }[];
  topProducts: { name: string; value: number }[];
};

export const useChartData = () => {
  // This is mock data for now - in a real implementation this would
  // likely come from API calls or database queries
  const [chartData] = useState<ChartData>({
    monthlyRevenue: [
      { month: 'Jan', value: 5000 },
      { month: 'Fev', value: 7500 },
      { month: 'Mar', value: 12000 },
      { month: 'Abr', value: 10000 },
      { month: 'Mai', value: 9000 },
      { month: 'Jun', value: 11000 }
    ],
    topServices: [
      { name: 'Troca de Óleo', value: 15000 },
      { name: 'Revisão Geral', value: 12000 },
      { name: 'Alinhamento', value: 8000 },
      { name: 'Balanceamento', value: 6000 },
      { name: 'Troca de Pastilhas', value: 4500 }
    ],
    topProducts: [
      { name: 'Óleo Motor', value: 8000 },
      { name: 'Filtro de Ar', value: 3500 },
      { name: 'Pastilhas de Freio', value: 7000 },
      { name: 'Filtro de Óleo', value: 2000 },
      { name: 'Pneus', value: 12000 }
    ]
  });

  return chartData;
};
