import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Mail, Settings, Eye, Package, Crown, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface NotaFiscal {
  id: string;
  tipo: 'entrada' | 'saida';
  numero: string;
  data_emissao: string;
  valor_total: number;
  status: string;
  fornecedor_id?: string;
  cliente_id?: string;
  fornecedor_nome?: string;
  fornecedor_cnpj?: string;
  cliente_nome?: string;
  cliente_documento?: string;
}

interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
}

const ContabilidadePage: React.FC = () => {
  const [notasEntrada, setNotasEntrada] = useState<NotaFiscal[]>([]);
  const [notasSaida, setNotasSaida] = useState<NotaFiscal[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { diasRestantes, isPremiumTrial, isExpired } = useDaysRemaining();
  const { user } = useAuth();

  // Verificar se tem acesso premium (admin ou trial ativo)
  const hasPermiumAccess = user?.role === 'admin' || user?.role === 'superadmin' || (isPremiumTrial && diasRestantes > 0);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar notas fiscais de entrada
      const { data: notasEntradaData, error: errorEntrada } = await supabase
        .from('notas_fiscais')
        .select('*')
        .eq('tipo', 'entrada')
        .order('created_at', { ascending: false });

      if (errorEntrada) {
        console.error('Erro ao carregar notas de entrada:', errorEntrada);
      }

      // Carregar notas fiscais de saída
      const { data: notasSaidaData, error: errorSaida } = await supabase
        .from('notas_fiscais')
        .select('*')
        .eq('tipo', 'saida')
        .order('created_at', { ascending: false });

      if (errorSaida) {
        console.error('Erro ao carregar notas de saída:', errorSaida);
      }

      // Carregar fornecedores
      const { data: fornecedoresData, error: errorFornecedores } = await supabase
        .from('fornecedores')
        .select('*')
        .order('nome');

      if (errorFornecedores) {
        console.error('Erro ao carregar fornecedores:', errorFornecedores);
      }

      // Carregar dados dos fornecedores para as notas de entrada
      const notasEntradaComFornecedores = await Promise.all(
        (notasEntradaData || []).map(async (nota: any) => {
          const notaFiscal: NotaFiscal = {
            id: nota.id,
            tipo: nota.tipo as 'entrada' | 'saida',
            numero: nota.numero,
            data_emissao: nota.data_emissao,
            valor_total: nota.valor_total,
            status: nota.status,
            fornecedor_id: nota.fornecedor_id,
            cliente_id: nota.cliente_id
          };

          if (nota.fornecedor_id) {
            const { data: fornecedor } = await supabase
              .from('fornecedores')
              .select('nome, cnpj')
              .eq('id', nota.fornecedor_id)
              .single();
            
            notaFiscal.fornecedor_nome = fornecedor?.nome;
            notaFiscal.fornecedor_cnpj = fornecedor?.cnpj;
          }
          return notaFiscal;
        })
      );

      // Carregar dados dos clientes para as notas de saída
      const notasSaidaComClientes = await Promise.all(
        (notasSaidaData || []).map(async (nota: any) => {
          const notaFiscal: NotaFiscal = {
            id: nota.id,
            tipo: nota.tipo as 'entrada' | 'saida',
            numero: nota.numero,
            data_emissao: nota.data_emissao,
            valor_total: nota.valor_total,
            status: nota.status,
            fornecedor_id: nota.fornecedor_id,
            cliente_id: nota.cliente_id
          };

          if (nota.cliente_id) {
            const { data: cliente } = await supabase
              .from('clients')
              .select('nome, documento')
              .eq('id', nota.cliente_id)
              .single();
            
            notaFiscal.cliente_nome = cliente?.nome;
            notaFiscal.cliente_documento = cliente?.documento;
          }
          return notaFiscal;
        })
      );

      setNotasEntrada(notasEntradaComFornecedores);
      setNotasSaida(notasSaidaComClientes);
      setFornecedores((fornecedoresData || []).map((f: any) => ({
        id: f.id,
        nome: f.nome,
        cnpj: f.cnpj,
        telefone: f.telefone,
        email: f.email
      })));

    } catch (error: any) {
      console.error('Erro geral:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados da contabilidade"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportarXML = () => {
    if (!hasPermiumAccess) {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "Importação de XML está disponível apenas no plano Premium"
      });
      return;
    }
    
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de importação de XML será implementada"
    });
  };

  const handleExportarXMLs = () => {
    if (!hasPermiumAccess) {
      toast({
        variant: "destructive",
        title: "Recurso Premium", 
        description: "Exportação de XMLs está disponível apenas no plano Premium"
      });
      return;
    }
    
    toast({
      title: "Em desenvolvimento", 
      description: "Funcionalidade de exportação será implementada"
    });
  };

  const handleEnviarContador = () => {
    if (!hasPermiumAccess) {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "Envio para contador está disponível apenas no plano Premium"
      });
      return;
    }
    
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de envio para contador será implementada"
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const renderPlanBanner = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      return (
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Modo Administrador - Acesso Total</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isPremiumTrial && diasRestantes > 0) {
      return (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Trial Premium Ativo - {diasRestantes} dias restantes
                </span>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Acesso Total
              </Badge>
            </div>
            <div className="mt-2 text-sm text-blue-700">
              <p className="font-medium mb-1">Recursos Premium disponíveis:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Módulo de estoque integrado</li>
                <li>Agendamento de serviços</li>
                <li>Relatórios avançados</li>
                <li>Suporte prioritário</li>
                <li>Backup automático</li>
                <li>Importação/Exportação de XMLs</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isExpired || diasRestantes === 0) {
      return (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-medium text-red-800 mb-2">Trial Expirado - Acesso Limitado</h3>
              <p className="text-sm text-red-700 mb-3">
                Você tem acesso apenas aos recursos essenciais. Faça upgrade para acessar recursos premium.
              </p>
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Recursos Essenciais disponíveis:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Cadastro de clientes ilimitado</li>
                  <li>Gestão de orçamentos</li>
                  <li>Controle de serviços</li>
                  <li>Relatórios básicos</li>
                  <li>Suporte via e-mail</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Contabilidade</h1>
            <p className="text-gray-600 mt-2">
              Gestão completa de notas fiscais, fornecedores e exportações contábeis
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleImportarXML} 
              className="flex items-center gap-2"
              disabled={!hasPermiumAccess}
            >
              <Upload className="h-4 w-4" />
              Importar XML
              {!hasPermiumAccess && <Crown className="h-4 w-4 ml-1" />}
            </Button>
            <Button 
              onClick={handleExportarXMLs} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={!hasPermiumAccess}
            >
              <Download className="h-4 w-4" />
              Exportar XMLs
              {!hasPermiumAccess && <Crown className="h-4 w-4 ml-1" />}
            </Button>
            <Button 
              onClick={handleEnviarContador} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={!hasPermiumAccess}
            >
              <Mail className="h-4 w-4" />
              Enviar para Contador
              {!hasPermiumAccess && <Crown className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>

      {renderPlanBanner()}

      <Tabs defaultValue="entrada" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entrada">📥 Notas de Entrada</TabsTrigger>
          <TabsTrigger value="saida">📤 Notas de Saída</TabsTrigger>
          <TabsTrigger value="exportacoes">📂 Exportações</TabsTrigger>
          <TabsTrigger value="configuracoes">🛠️ Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="entrada">
          <Card>
            <CardHeader>
              <CardTitle>Notas Fiscais de Entrada</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : notasEntrada.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Nenhuma nota fiscal de entrada</h3>
                  <p className="text-gray-500 mt-2">Importe XMLs de notas fiscais para começar</p>
                  <Button onClick={handleImportarXML} className="mt-4" disabled={!hasPermiumAccess}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar primeiro XML
                    {!hasPermiumAccess && <Crown className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nº da Nota
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fornecedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Emissão
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notasEntrada.map((nota) => (
                        <tr key={nota.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {nota.numero}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div className="font-medium">{nota.fornecedor_nome}</div>
                              <div className="text-xs text-gray-400">{nota.fornecedor_cnpj}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(nota.data_emissao)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(nota.valor_total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              nota.status === 'importado' ? 'bg-green-100 text-green-800' :
                              nota.status === 'erro' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {nota.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Package className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saida">
          <Card>
            <CardHeader>
              <CardTitle>Notas Fiscais de Saída</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : notasSaida.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Nenhuma nota fiscal de saída</h3>
                  <p className="text-gray-500 mt-2">Notas de saída aparecerão automaticamente quando você emitir vendas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nº da Nota
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Emissão
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notasSaida.map((nota) => (
                        <tr key={nota.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {nota.numero}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div className="font-medium">{nota.cliente_nome}</div>
                              <div className="text-xs text-gray-400">{nota.cliente_documento}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(nota.data_emissao)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(nota.valor_total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              nota.status === 'emitido' ? 'bg-green-100 text-green-800' :
                              nota.status === 'erro' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {nota.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exportacoes">
          <Card>
            <CardHeader>
              <CardTitle>📂 Histórico de Exportações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhuma exportação realizada</h3>
                <p className="text-gray-500 mt-2">O histórico de exportações aparecerá aqui</p>
                {!hasPermiumAccess && (
                  <Badge variant="outline" className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Recurso Premium
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle>🛠️ Configurações Contábeis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Dados da Empresa</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNPJ/CPF
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Regime Tributário
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>Simples Nacional</option>
                        <option>Lucro Presumido</option>
                        <option>Lucro Real</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Contador</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail do Contador
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="contador@empresa.com.br"
                      />
                    </div>
                    <Button className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Integrações</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Omie</h4>
                        <p className="text-sm text-gray-500">Sistema de gestão empresarial</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" disabled={!hasPermiumAccess}>
                          Conectar
                        </Button>
                        {!hasPermiumAccess && <Crown className="h-4 w-4 text-yellow-600" />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Nibo</h4>
                        <p className="text-sm text-gray-500">Plataforma contábil online</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" disabled={!hasPermiumAccess}>
                          Conectar
                        </Button>
                        {!hasPermiumAccess && <Crown className="h-4 w-4 text-yellow-600" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContabilidadePage;
