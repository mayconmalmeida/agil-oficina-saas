
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';

interface ImportResult {
  produtos_processados: Array<{
    nome: string;
    codigo: string;
    quantidade: string;
    status: 'novo' | 'atualizado';
  }>;
  novos_produtos: Array<any>;
  produtos_atualizados: Array<any>;
}

const XmlImportDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xml')) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo XML válido.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Ler conteúdo do arquivo XML
      const xmlContent = await file.text();
      
      // Parse básico do XML (aqui você implementaria um parser mais robusto)
      const produtos = parseXmlToProducts(xmlContent);
      
      if (produtos.length === 0) {
        toast({
          variant: "destructive",
          title: "Nenhum produto encontrado",
          description: "O arquivo XML não contém produtos válidos.",
        });
        return;
      }

      // Processar produtos via função do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para importar produtos.",
        });
        return;
      }

      const { data, error } = await supabase.rpc('process_nfce_xml', {
        p_user_id: session.user.id,
        p_produtos: produtos
      });

      if (error) {
        console.error('Erro ao processar XML:', error);
        toast({
          variant: "destructive",
          title: "Erro ao processar XML",
          description: error.message || "Erro desconhecido ao processar o arquivo.",
        });
        return;
      }

      setImportResult(data);
      
      toast({
        title: "Importação concluída!",
        description: `${data.novos_produtos.length} produtos novos e ${data.produtos_atualizados.length} produtos atualizados.`,
      });

    } catch (error) {
      console.error('Erro ao importar XML:', error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: "Erro ao processar o arquivo XML.",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseXmlToProducts = (xmlContent: string) => {
    // Parser básico para demonstração
    // Em produção, use uma biblioteca como xml2js ou fast-xml-parser
    const produtos: Array<{
      nome: string;
      codigo: string;
      quantidade: string;
      preco_unitario: string;
    }> = [];

    try {
      // Regex básico para extrair produtos (implementação simplificada)
      const produtoRegex = /<det[^>]*>[\s\S]*?<\/det>/g;
      const matches = xmlContent.match(produtoRegex);

      matches?.forEach(match => {
        const nomeMatch = match.match(/<xProd>(.*?)<\/xProd>/);
        const codigoMatch = match.match(/<cProd>(.*?)<\/cProd>/);
        const qtdMatch = match.match(/<qCom>(.*?)<\/qCom>/);
        const precoMatch = match.match(/<vUnCom>(.*?)<\/vUnCom>/);

        if (nomeMatch && codigoMatch && qtdMatch && precoMatch) {
          produtos.push({
            nome: nomeMatch[1],
            codigo: codigoMatch[1],
            quantidade: qtdMatch[1],
            preco_unitario: precoMatch[1]
          });
        }
      });
    } catch (error) {
      console.error('Erro ao fazer parse do XML:', error);
    }

    return produtos;
  };

  const handleClose = () => {
    setIsOpen(false);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileUp className="h-4 w-4" />
          Importar XML
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Produtos via XML</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!importResult ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="xml-file">Selecione o arquivo XML da Nota Fiscal</Label>
                <Input
                  id="xml-file"
                  type="file"
                  accept=".xml"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
              </div>
              
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Processando arquivo XML...</span>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                <p>• O arquivo deve ser um XML válido de Nota Fiscal Eletrônica</p>
                <p>• Os produtos serão adicionados ao seu estoque automaticamente</p>
                <p>• Produtos já existentes terão o estoque atualizado</p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Importação concluída com sucesso!</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {importResult.novos_produtos.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Produtos novos
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {importResult.produtos_atualizados.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Produtos atualizados
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {importResult.produtos_processados.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Produtos processados:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.produtos_processados.map((produto, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {produto.status === 'novo' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-blue-500" />
                        )}
                        <span>{produto.nome}</span>
                        <span className="text-muted-foreground">
                          ({produto.status === 'novo' ? 'Novo' : 'Atualizado'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button onClick={handleClose} className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default XmlImportDialog;
