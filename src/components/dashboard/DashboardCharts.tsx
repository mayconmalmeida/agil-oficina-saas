
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { formatCurrency } from '@/utils/formatUtils';
import { Button } from '@/components/ui/button';
import { BarChart3, Lock, AlertTriangle } from 'lucide-react';

type MonthlyData = { month: string; value: number; services: number }[];
type TopItem = { name: string; value: number }[];
type ServiceType = { name: string; value: number }[];
type StockItem = { name: string; quantity: number; minimum: number }[];

interface DashboardChartsProps {
  monthlyRevenue: MonthlyData;
  topServices: TopItem;
  topClients: TopItem;
  serviceTypes: ServiceType;
  criticalStock: StockItem;
  isPremium: boolean;
  isLoading?: boolean;
  onUpgradePlan: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#ff6b6b'];

const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  monthlyRevenue, 
  topServices, 
  topClients,
  serviceTypes,
  criticalStock,
  isPremium,
  isLoading = false,
  onUpgradePlan
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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

  if (!isPremium) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Relatórios e Gráficos</h2>
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
                <p className="text-sm text-gray-500 mb-4">Visualize dados de faturamento, serviços e muito mais</p>
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
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md text-sm">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'value' ? `Faturamento: ${formatCurrency(entry.value)}` : 
               entry.dataKey === 'services' ? `Serviços: ${entry.value}` :
               `${entry.name}: ${entry.value}`}
            </p>
          ))}
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
          <p className="text-oficina">{`${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Relatórios e Análises</h2>
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
      
      {/* Linha 1: Faturamento e Serviços Mensais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Serviços por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="services" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linha 2: Top Clientes e Serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Clientes que Mais Faturam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClients} layout="horizontal">
                  <XAxis type="number" tickFormatter={(value) => `R$${value/1000}k`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Serviços Mais Realizados</CardTitle>
          </CardHeader>
          <CardContent>
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
      </div>

      {/* Linha 3: Tipos de Serviços e Estoque Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tipos de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#82ca9d"
                    dataKey="value"
                  >
                    {serviceTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieCustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Estoque Crítico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalStock.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600">Mínimo: {item.minimum} unidades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">{item.quantity}</p>
                    <p className="text-xs text-gray-500">disponível</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
