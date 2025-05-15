import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, Download, Trash2, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Document {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface CompanyDocumentsProps {
  documents: Document[];
  userId: string;
  onSave: () => void;
}

const CompanyDocuments: React.FC<CompanyDocumentsProps> = ({ documents: initialDocuments, userId, onSave }) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentName, setDocumentName] = useState('');
  const { toast } = useToast();

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files[0] || !documentName.trim()) {
      if (!documentName.trim()) {
        toast({
          variant: "destructive",
          title: "Nome obrigatório",
          description: "Informe um nome para o documento antes de fazer upload.",
        });
      }
      return;
    }
    
    const file = files[0];
    
    // Validation
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 10MB.",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simula progresso já que o Supabase não fornece
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 5;
          return next > 95 ? 95 : next;
        });
      }, 100);
      
      // Gera um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `doc-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/documents/${fileName}`;
      
      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearInterval(progressInterval);
      
      if (error) throw error;
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      setUploadProgress(100);
      
      // Criar um novo documento
      const newDocument: Document = {
        id: fileName,
        name: documentName,
        url: publicUrl,
        created_at: new Date().toISOString()
      };
      
      // Atualizar a lista de documentos
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      
      // Atualizar o perfil com os novos documentos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          documents: updatedDocuments 
        } as any)
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Upload concluído",
        description: "O documento foi adicionado com sucesso.",
      });
      
      setDocumentName('');
      onSave();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao fazer o upload do documento.",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  };
  
  const handleRemoveDocument = async (documentToRemove: Document) => {
    if (!window.confirm(`Tem certeza que deseja remover o documento "${documentToRemove.name}"?`)) {
      return;
    }
    
    try {
      // Filtrar o documento removido
      const updatedDocuments = documents.filter(doc => doc.id !== documentToRemove.id);
      setDocuments(updatedDocuments);
      
      // Atualizar o perfil
      const { error } = await supabase
        .from('profiles')
        .update({ 
          documents: updatedDocuments 
        } as any)
        .eq('id', userId);
      
      if (error) throw error;
      
      // Não removemos o arquivo do storage para manter histórico
      
      toast({
        title: "Documento removido",
        description: "O documento foi removido com sucesso.",
      });
      
      onSave();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover documento",
        description: error.message || "Ocorreu um erro ao remover o documento.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-gray-600">
          Faça upload de documentos importantes para sua oficina como certificações, licenças, alvarás, etc.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document-name">Nome do documento</Label>
              <Input 
                id="document-name"
                placeholder="Ex: Alvará de Funcionamento" 
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                disabled={isUploading}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('document-upload')?.click()}
                  disabled={isUploading || !documentName.trim()}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Selecionar arquivo
                    </>
                  )}
                </Button>
                
                <input 
                  type="file"
                  id="document-upload"
                  className="hidden"
                  onChange={handleDocumentUpload}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>
          
          {uploadProgress > 0 && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center mt-1">{uploadProgress}%</p>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">Documentos salvos</h3>
            
            {documents.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FileText className="mx-auto h-8 w-8 opacity-50" />
                <p className="mt-2">Nenhum documento salvo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <p className="text-xs text-gray-500">
                          Adicionado em {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="icon" 
                        variant="outline"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </a>
                      </Button>
                      
                      <Button 
                        size="icon" 
                        variant="destructive"
                        onClick={() => handleRemoveDocument(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDocuments;
