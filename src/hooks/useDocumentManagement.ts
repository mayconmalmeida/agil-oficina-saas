
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export const useDocumentManagement = (
  initialDocuments: Document[],
  userId: string,
  onSave: () => void
) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadDocument = async (file: File, documentName: string) => {
    // Validation
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 10MB.",
      });
      return;
    }
    
    if (!documentName.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Informe um nome para o documento antes de fazer upload.",
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

  const removeDocument = async (documentToRemove: Document) => {
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

  return {
    documents,
    isUploading,
    uploadProgress,
    uploadDocument,
    removeDocument
  };
};
