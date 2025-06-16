
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileSpreadsheet, Download, Upload, Settings, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { integracaoContabilService, ExportOptions } from '@/services/integracaoContabilService';

const IntegracaoContabilPage: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeOrcamentos: true,
    includeClientes: true,
    includeServicos: true,
    startDate: '',
    endDate: ''
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await integracaoContabilService.exportarDados(exportOptions);
      
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0];
      const extension = exportOptions.format === 'excel' ? 'xlsx' : exportOptions.format;
      const filename = `exportacao_${timestamp}.${extension}`;
      
      integracaoContabilService.downloadFile(blob, filename);
      
      toast({
        title: "Exportação concluída",
        description: `Dados exportados com sucesso para ${filename}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await integracaoContabilService.importarDados(file);
      
      toast({
        title: "Importação concluída",
        description: "Dados importados com sucesso!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error.message,
      });
    } finally {
      setIsImporting(false);
      // Limpa o input
      event.target.value = '';
    }
  };

  const handleConfigureIntegrations = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A configuração de integrações externas estará disponível em breve.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Database className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Integração Contábil</h1>
      </div>

      {/* Configurações de Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <span>Exportar Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Formato de Exportação</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value: 'xml' | 'excel' | 'csv') => 
                  setExportOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xml">XML (NFCe/NFe)</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Período</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={exportOptions.startDate}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, startDate: e.target.value }))}
                  placeholder="Data inicial"
                />
                <Input
                  type="date"
                  value={exportOptions.endDate}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, endDate: e.target.value }))}
                  placeholder="Data final"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dados para Exportar</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="orcamentos"
                  checked={exportOptions.includeOrcamentos}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeOrcamentos: !!checked }))
                  }
                />
                <Label htmlFor="orcamentos">Orçamentos</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clientes"
                  checked={exportOptions.includeClientes}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeClientes: !!checked }))
                  }
                />
                <Label htmlFor="clientes">Clientes</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="servicos"
                  checked={exportOptions.includeServicos}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeServicos: !!checked }))
                  }
                />
                <Label htmlFor="servicos">Serviços</Label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Importação de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <span>Importar Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Importe dados de outros sistemas contábeis. Formatos suportados: CSV, Excel (.xlsx)
          </p>
          <div className="space-y-2">
            <Label htmlFor="import-file">Selecionar Arquivo</Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              disabled={isImporting}
            />
            {isImporting && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Importando dados...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Integração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <span>Configurações de Integração</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Configure as integrações com sistemas contábeis externos como Sage, Domínio, ContaAzul, Conta Simples e outros.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <h4 className="font-medium">Sage</h4>
              <p className="text-sm text-gray-500 mb-2">Integração com Sage One</p>
              <Button variant="outline" size="sm" onClick={handleConfigureIntegrations}>
                Configurar
              </Button>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-medium">ContaAzul</h4>
              <p className="text-sm text-gray-500 mb-2">Sincronização automática</p>
              <Button variant="outline" size="sm" onClick={handleConfigureIntegrations}>
                Configurar
              </Button>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-medium">Domínio</h4>
              <p className="text-sm text-gray-500 mb-2">Exportação direta</p>
              <Button variant="outline" size="sm" onClick={handleConfigureIntegrations}>
                Configurar
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Exportações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <span>Histórico de Exportações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Nenhuma exportação realizada ainda.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegracaoContabilPage;
