
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Mail, Settings, Eye, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface NotaFiscal {
  id: string;
  tipo: 'entrada' | 'saida';
  numero: string;
  data_emissao: string;
  valor_total: number;
  status: string;
  fornecedores?: {
    nome: string;
    cnpj: string;
  };
  clients?: {
    nome: string;
    documento: string;
  };
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

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar notas fiscais de entrada usando query SQL raw
      const { data: notasEntradaData } = await supabase
        .from('notas_fiscais' as any)
        .select(`
          *,
          fornecedores(nome, cnpj)
        `)
        .eq('tipo', 'entrada')
        .order('created_at', { ascending: false });

      // Carregar notas fiscais de saída
      const { data: notasSaidaData } = await supabase
        .from('notas_fiscais' as any)
        .select(`
          *,
          clients(nome, documento)
        `)
        .eq('tipo', 'saida')
        .order('created_at', { ascending: false });

      // Carregar fornecedores
      const { data: fornecedoresData } = await supabase
        .from('fornecedores' as any)
        .select('*')
        .order('nome');

      setNotasEntrada(notasEntradaData || []);
      setNotasSaida(notasSaidaData || []);
      setFornecedores(fornecedoresData || []);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportarXML = () => {
    // Implementar importação de XML
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de importação de XML será implementada"
    });
  };

  const handleExportarXMLs = () => {
    // Implementar exportação de XMLs
    toast({
      title: "Em desenvolvimento", 
      description: "Funcionalidade de exportação será implementada"
    });
  };

  const handleEnviarContador = () => {
    // Implementar envio para contador
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
            <Button onClick={handleImportarXML} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar XML
            </Button>
            <Button onClick={handleExportarXMLs} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar XMLs
            </Button>
            <Button onClick={handleEnviarContador} variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Enviar para Contador
            </Button>
          </div>
        </div>
      </div>

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
                  <Button onClick={handleImportarXML} className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar primeiro XML
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
                              <div className="font-medium">{nota.fornecedores?.nome}</div>
                              <div className="text-xs text-gray-400">{nota.fornecedores?.cnpj}</div>
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
                              <div className="font-medium">{nota.clients?.nome}</div>
                              <div className="text-xs text-gray-400">{nota.clients?.documento}</div>
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
                      <Button variant="outline">Conectar</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Nibo</h4>
                        <p className="text-sm text-gray-500">Plataforma contábil online</p>
                      </div>
                      <Button variant="outline">Conectar</Button>
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
