
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { formatCurrency } from '@/utils/formatUtils';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { Button } from '@/components/ui/button';
import { BarChart3, Lock } from 'lucide-react';

type MonthlyRevenue = { month: string; value: number }[];
type TopItem = { name: string; value: number }[];

interface DashboardChartsProps {
  monthlyRevenue: MonthlyRevenue;
  topServices: TopItem;
  topProducts: TopItem;
  isPremium: boolean;
  isLoading?: boolean;
  onUpgradePlan: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  monthlyRevenue, 
  topServices, 
  topProducts,
  isPremium,
  isLoading = false,
  onUpgradePlan
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-40 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Se não é premium, exibe uma versão bloqueada dos gráficos
  if (!isPremium) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Relatórios Mensais</h2>
          <Button variant="default" size="sm" onClick={onUpgradePlan}>
            Fazer Upgrade
          </Button>
        </div>
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Lock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600">Gráficos disponíveis no plano Premium</h3>
                <p className="text-sm text-gray-500 mb-4">Visualize dados de faturamento e serviços mais populares</p>
                <Button onClick={onUpgradePlan}>Upgrade para Premium</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm text-sm">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-oficina">{`${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
  
    return null;
  };

  const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm text-sm">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-oficina">{`${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Relatórios Mensais</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onUpgradePlan}
          className="text-sm"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Ver todos relatórios
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Faturamento Mensal */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium mb-4">Faturamento Mensal</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyRevenue}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Serviços Mais Realizados */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium mb-4">Serviços Mais Realizados</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topServices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topServices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieCustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Peças Mais Vendidas */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium mb-4">Peças Mais Vendidas</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#82ca9d"
                    dataKey="value"
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieCustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
