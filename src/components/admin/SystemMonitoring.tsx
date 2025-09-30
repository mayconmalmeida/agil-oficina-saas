import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  HardDrive,
  Users,
  Globe,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  activeUsers: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  errorRate: number;
  requestsPerMinute: number;
  lastUpdated: string;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  authentication: 'healthy' | 'warning' | 'critical';
}

interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

const SystemMonitoring: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 0,
    responseTime: 0,
    activeUsers: 0,
    databaseConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0,
    errorRate: 0,
    requestsPerMinute: 0,
    lastUpdated: new Date().toISOString()
  });

  const [health, setHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    authentication: 'healthy'
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simular métricas do sistema (em produção, isso viria de APIs reais)
  const generateMockMetrics = (): SystemMetrics => {
    const now = new Date();
    return {
      uptime: Math.floor(Math.random() * 720) + 24, // 24-744 horas
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      activeUsers: Math.floor(Math.random() * 50) + 10, // 10-60 usuários
      databaseConnections: Math.floor(Math.random() * 20) + 5, // 5-25 conexões
      memoryUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
      cpuUsage: Math.floor(Math.random() * 30) + 10, // 10-40%
      diskUsage: Math.floor(Math.random() * 20) + 40, // 40-60%
      errorRate: Math.random() * 2, // 0-2%
      requestsPerMinute: Math.floor(Math.random() * 100) + 50, // 50-150 req/min
      lastUpdated: now.toISOString()
    };
  };

  const generateMockHealth = (): SystemHealth => {
    const statuses: Array<'healthy' | 'warning' | 'critical'> = ['healthy', 'healthy', 'healthy', 'warning'];
    return {
      database: statuses[Math.floor(Math.random() * statuses.length)],
      api: statuses[Math.floor(Math.random() * statuses.length)],
      storage: statuses[Math.floor(Math.random() * statuses.length)],
      authentication: statuses[Math.floor(Math.random() * statuses.length)]
    };
  };

  const generateMockAlerts = (): AlertItem[] => {
    const alertMessages = [
      { type: 'info' as const, message: 'Sistema atualizado com sucesso' },
      { type: 'warning' as const, message: 'Uso de memória acima de 70%' },
      { type: 'info' as const, message: 'Backup automático concluído' },
      { type: 'warning' as const, message: 'Tempo de resposta elevado detectado' }
    ];

    return alertMessages.slice(0, Math.floor(Math.random() * 3) + 1).map((alert, index) => ({
      id: `alert-${index}`,
      ...alert,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
    }));
  };

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMetrics = generateMockMetrics();
      const newHealth = generateMockHealth();
      const newAlerts = generateMockAlerts();

      setMetrics(newMetrics);
      setHealth(newHealth);
      setAlerts(newAlerts);

      // Verificar alertas críticos
      if (newMetrics.errorRate > 1.5) {
        toast({
          title: "Alerta do Sistema",
          description: "Taxa de erro elevada detectada",
          variant: "destructive"
        });
      }

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as métricas do sistema",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoramento do Sistema</h1>
          <p className="text-gray-600">Métricas em tempo real e saúde do sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da API</CardTitle>
            {getHealthIcon(health.api)}
          </CardHeader>
          <CardContent>
            <Badge className={getHealthColor(health.api)}>
              {health.api === 'healthy' ? 'Saudável' : 
               health.api === 'warning' ? 'Atenção' : 'Crítico'}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              Tempo de resposta: {metrics.responseTime}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Badge className={getHealthColor(health.database)}>
              {health.database === 'healthy' ? 'Saudável' : 
               health.database === 'warning' ? 'Atenção' : 'Crítico'}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.databaseConnections} conexões ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
            <HardDrive className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Badge className={getHealthColor(health.storage)}>
              {health.storage === 'healthy' ? 'Saudável' : 
               health.storage === 'warning' ? 'Atenção' : 'Crítico'}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.diskUsage}% utilizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autenticação</CardTitle>
            <Shield className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Badge className={getHealthColor(health.authentication)}>
              {health.authentication === 'healthy' ? 'Saudável' : 
               health.authentication === 'warning' ? 'Atenção' : 'Crítico'}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              Sistema seguro
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Métricas do Servidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uso de CPU</span>
                <span className="text-sm text-gray-500">{metrics.cpuUsage}%</span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uso de Memória</span>
                <span className="text-sm text-gray-500">{metrics.memoryUsage}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uso de Disco</span>
                <span className="text-sm text-gray-500">{metrics.diskUsage}%</span>
              </div>
              <Progress value={metrics.diskUsage} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Uptime
                </span>
                <span className="text-sm text-gray-500">{formatUptime(metrics.uptime)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Atividade do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Usuários Ativos
              </span>
              <span className="text-2xl font-bold text-blue-600">{metrics.activeUsers}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                Requisições/min
              </span>
              <span className="text-2xl font-bold text-green-600">{metrics.requestsPerMinute}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                Taxa de Erro
              </span>
              <span className={`text-2xl font-bold ${metrics.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.errorRate.toFixed(2)}%
              </span>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última Atualização</span>
                <span className="text-xs text-gray-500">{formatTimestamp(metrics.lastUpdated)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Alertas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              Nenhum alerta no momento
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className={`p-1 rounded-full ${
                    alert.type === 'error' ? 'bg-red-100 text-red-600' :
                    alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {alert.type === 'error' ? <AlertTriangle className="h-4 w-4" /> :
                     alert.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                     <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(alert.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;