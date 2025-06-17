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
import ImportXmlModal from '@/components/contabilidade/ImportXmlModal';
import ExportXmlModal from '@/components/contabilidade/ExportXmlModal';
import SendToAccountantModal from '@/components/contabilidade/SendToAccountantModal';
import ExportHistoryTable from '@/components/contabilidade/ExportHistoryTable';
import NotaFiscalDetailsModal from '@/components/contabilidade/NotaFiscalDetailsModal';
import ExportDetailsModal from '@/components/contabilidade/ExportDetailsModal';

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

interface ExportRecord {
  id: string;
  tipo: string;
  periodo: string;
  formato: string;
  status: 'concluido' | 'erro' | 'processando';
  data_criacao: string;
  tamanho: string;
}

const ContabilidadePage: React.FC = () => {
  const [notasEntrada, setNotasEntrada] = useState<NotaFiscal[]>([]);
  const [notasSaida, setNotasSaida] = useState<NotaFiscal[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showNotaDetailsModal, setShowNotaDetailsModal] = useState(false);
  const [showExportDetailsModal, setShowExportDetailsModal] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
  const [selectedExport, setSelectedExport] = useState<ExportRecord | null>(null);
  const { toast } = useToast();
  const { diasRestantes, isPremiumTrial, isExpired } = useDaysRemaining();
  const { user } = useAuth();

  // Verificar se tem acesso premium (admin ou trial ativo)
  const hasPremiumAccess = user?.role === 'admin' || user?.role === 'superadmin' || (isPremiumTrial && diasRestantes > 0);

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

      // Converter dados para tipos corretos
      const notasEntradaProcessadas = (notasEntradaData || []).map((nota: any): NotaFiscal => ({
        id: nota.id,
        tipo: nota.tipo as 'entrada' | 'saida',
        numero: nota.numero,
        data_emissao: nota.data_emissao,
        valor_total: nota.valor_total,
        status: nota.status,
        fornecedor_id: nota.fornecedor_id,
        cliente_id: nota.cliente_id
      }));

      const notasSaidaProcessadas = (notasSaidaData || []).map((nota: any): NotaFiscal => ({
        id: nota.id,
        tipo: nota.tipo as 'entrada' | 'saida',
        numero: nota.numero,
        data_emissao: nota.data_emissao,
        valor_total: nota.valor_total,
        status: nota.status,
        fornecedor_id: nota.fornecedor_id,
        cliente_id: nota.cliente_id
      }));

      setNotasEntrada(notasEntradaProcessadas);
      setNotasSaida(notasSaidaProcessadas);
      setFornecedores((fornecedoresData || []).map((f: any): Fornecedor => ({
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
    if (!hasPremiumAccess) {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "Importação de XML está disponível apenas no plano Premium"
      });
      return;
    }
    setShowImportModal(true);
  };

  const handleExportarXMLs = () => {
    if (!hasPremiumAccess) {
      toast({
        variant: "destructive",
        title: "Recurso Premium", 
        description: "Exportação de XMLs está disponível apenas no plano Premium"
      });
      return;
    }
    setShowExportModal(true);
  };

  const handleEnviarContador = () => {
    if (!hasPremiumAccess) {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "Envio para contador está disponível apenas no plano Premium"
      });
      return;
    }
    setShowSendModal(true);
  };

  const handleViewNota = (nota: NotaFiscal) => {
    setSelectedNota(nota);
    setShowNotaDetailsModal(true);
  };

  const handleDownloadNota = (nota: NotaFiscal) => {
    // Simular download de XML da nota fiscal
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfe>
  <infNFe>
    <ide>
      <nNF>${nota.numero}</nNF>
      <dhEmi>${nota.data_emissao}</dhEmi>
    </ide>
    <emit>
      <xNome>${nota.fornecedor_nome || nota.cliente_nome || 'N/A'}</xNome>
      <CNPJ>${nota.fornecedor_cnpj || nota.cliente_documento || 'N/A'}</CNPJ>
    </emit>
    <total>
      <ICMSTot>
        <vNF>${nota.valor_total.toFixed(2)}</vNF>
      </ICMSTot>
    </total>
  </infNFe>
</nfe>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota_fiscal_${nota.numero}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download concluído",
      description: `Nota fiscal ${nota.numero} baixada com sucesso!`,
    });
  };

  const handleViewExport = (exportRecord: ExportRecord) => {
    setSelectedExport(exportRecord);
    setShowExportDetailsModal(true);
  };

  const handleDownloadExport = (exportRecord: ExportRecord) => {
    // Simular download do arquivo de exportação
    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (exportRecord.formato) {
      case 'xml':
        content = `<?xml version="1.0" encoding="UTF-8"?>
<exportacao tipo="${exportRecord.tipo}" periodo="${exportRecord.periodo}">
  <resumo>
    <total_registros>10</total_registros>
    <data_exportacao>${exportRecord.data_criacao}</data_exportacao>
  </resumo>
</exportacao>`;
        fileName = `${exportRecord.tipo.toLowerCase().replace(' ', '_')}_${exportRecord.periodo}.xml`;
        mimeType = 'application/xml';
        break;
      case 'excel':
        content = `Tipo,Período,Data Exportação\n${exportRecord.tipo},${exportRecord.periodo},${exportRecord.data_criacao}`;
        fileName = `${exportRecord.tipo.toLowerCase().replace(' ', '_')}_${exportRecord.periodo}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        content = `Exportação: ${exportRecord.tipo}\nPeríodo: ${exportRecord.periodo}\nData: ${exportRecord.data_criacao}`;
        fileName = `${exportRecord.tipo.toLowerCase().replace(' ', '_')}_${exportRecord.periodo}.txt`;
        mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download concluído",
      description: `Arquivo ${fileName} baixado com sucesso!`,
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
              <p className="text-sm text-red-700">
                Você tem acesso apenas aos recursos essenciais. Faça upgrade para acessar recursos premium.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  // Mock data para histórico de exportações
  const mockExports: ExportRecord[] = [
    {
      id: '1',
      tipo: 'Notas de Entrada',
      periodo: 'Jan/2024',
      formato: 'xml',
      status: 'concluido' as const,
      data_criacao: '2024-01-31',
      tamanho: '2.5 MB'
    },
    {
      id: '2',
      tipo: 'Notas de Saída',
      periodo: 'Dez/2023',
      formato: 'excel',
      status: 'concluido' as const,
      data_criacao: '2023-12-31',
      tamanho: '1.8 MB'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Contabilidade</h1>
              <p className="text-gray-600 mt-2">
                Gestão completa de notas fiscais, fornecedores e exportações contábeis
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleImportarXML} 
                className="flex items-center gap-2"
                disabled={!hasPremiumAccess}
              >
                <Upload className="h-4 w-4" />
                Importar XML
                {!hasPremiumAccess && <Crown className="h-4 w-4 ml-1" />}
              </Button>
              <Button 
                onClick={handleExportarXMLs} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={!hasPremiumAccess}
              >
                <Download className="h-4 w-4" />
                Exportar XMLs
                {!hasPremiumAccess && <Crown className="h-4 w-4 ml-1" />}
              </Button>
              <Button 
                onClick={handleEnviarContador} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={!hasPremiumAccess}
              >
                <Mail className="h-4 w-4" />
                Enviar para Contador
                {!hasPremiumAccess && <Crown className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>

        {renderPlanBanner()}

        <Tabs defaultValue="entrada" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
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
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma nota fiscal de entrada</h3>
                    <p className="text-gray-500 mb-4">Importe XMLs de notas fiscais para começar</p>
                    <Button onClick={handleImportarXML} disabled={!hasPremiumAccess}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar primeiro XML
                      {!hasPremiumAccess && <Crown className="h-4 w-4 ml-2" />}
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
                          <tr key={nota.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {nota.numero}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                <div className="font-medium">{nota.fornecedor_nome || 'N/A'}</div>
                                <div className="text-xs text-gray-400">{nota.fornecedor_cnpj || 'N/A'}</div>
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
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewNota(nota)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDownloadNota(nota)}
                                  className="h-8 w-8 p-0"
                                >
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

          <TabsContent value="saida">
            <Card>
              <CardHeader>
                <CardTitle>Notas Fiscais de Saída</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : notasSaida.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma nota fiscal de saída</h3>
                    <p className="text-gray-500">Notas de saída aparecerão automaticamente quando você emitir vendas</p>
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
                          <tr key={nota.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {nota.numero}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                <div className="font-medium">{nota.cliente_nome || 'N/A'}</div>
                                <div className="text-xs text-gray-400">{nota.cliente_documento || 'N/A'}</div>
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
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewNota(nota)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDownloadNota(nota)}
                                  className="h-8 w-8 p-0"
                                >
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
                <ExportHistoryTable 
                  exports={mockExports} 
                  onView={handleViewExport}
                  onDownload={handleDownloadExport}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>🛠️ Configurações Contábeis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Dados da Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CNPJ/CPF
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Regime Tributário
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          <Button variant="outline" disabled={!hasPremiumAccess}>
                            Conectar
                          </Button>
                          {!hasPremiumAccess && <Crown className="h-4 w-4 text-yellow-600" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Nibo</h4>
                          <p className="text-sm text-gray-500">Plataforma contábil online</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" disabled={!hasPremiumAccess}>
                            Conectar
                          </Button>
                          {!hasPremiumAccess && <Crown className="h-4 w-4 text-yellow-600" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais */}
        <ImportXmlModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={carregarDados}
        />
        <ExportXmlModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
        <SendToAccountantModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
        />
        <NotaFiscalDetailsModal
          isOpen={showNotaDetailsModal}
          onClose={() => setShowNotaDetailsModal(false)}
          nota={selectedNota}
          onDownload={handleDownloadNota}
        />
        <ExportDetailsModal
          isOpen={showExportDetailsModal}
          onClose={() => setShowExportDetailsModal(false)}
          exportRecord={selectedExport}
          onDownload={handleDownloadExport}
        />
      </div>
    </div>
  );
};

export default ContabilidadePage;
