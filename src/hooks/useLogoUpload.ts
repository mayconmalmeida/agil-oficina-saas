
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface UseLogoUploadProps {
  userId: string;
  initialLogo: string | null;
  onSave: () => void;
}

export const useLogoUpload = ({ userId, initialLogo, onSave }: UseLogoUploadProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogo);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Atualizar logoUrl quando initialLogo mudar
  useEffect(() => {
    setLogoUrl(initialLogo);
  }, [initialLogo]);

  const checkBucket = async () => {
    if (!userId) {
      console.warn("userId não fornecido para checkBucket");
      return;
    }
    
    try {
      console.log("Verificando se o bucket 'logos' existe");
      
      const { data, error } = await supabase.storage
        .from('logos')
        .list('', { limit: 1 });
      
      if (error) {
        console.warn("Erro ao verificar bucket:", error.message);
      } else {
        console.log("Bucket 'logos' está acessível");
      }
    } catch (err) {
      console.error('Erro ao verificar bucket:', err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !userId) {
      console.warn("Arquivo ou userId não fornecido");
      return;
    }
    
    // Validação
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, GIF).",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timeStamp = Date.now();
      const safeFileName = `logo-${timeStamp}.${fileExt}`;
      const filePath = `${userId}/${safeFileName}`;
      
      // Simulação de progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 5;
          return next > 95 ? 95 : next;
        });
      }, 100);
      
      console.log("Iniciando upload para bucket 'logos', caminho:", filePath);
      
      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearInterval(progressInterval);
      
      if (error) {
        console.error("Erro no upload:", error);
        throw error;
      }
      
      console.log("Upload concluído com sucesso:", data);
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
      
      console.log("URL pública gerada:", publicUrl);
      
      setUploadProgress(100);
      
      // Adicionar timestamp para forçar atualização da imagem no cache do browser
      const urlWithTimestamp = `${publicUrl}?t=${timeStamp}`;
      setLogoUrl(urlWithTimestamp);
      
      // Atualiza o perfil com o novo logo
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          logo_url: urlWithTimestamp 
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Erro ao atualizar perfil:", updateError);
        throw updateError;
      }
      
      toast({
        title: "Upload concluído",
        description: "O logo da sua empresa foi atualizado com sucesso.",
      });
      
      onSave();
      
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao fazer o upload da imagem.",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  };
  
  const handleRemoveLogo = async () => {
    if (!logoUrl || !userId || !window.confirm('Tem certeza que deseja remover o logo?')) {
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Remove o logo do perfil
      const { error } = await supabase
        .from('profiles')
        .update({ 
          logo_url: null 
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      setLogoUrl(null);
      
      toast({
        title: "Logo removido",
        description: "O logo da sua empresa foi removido com sucesso.",
      });
      
      onSave();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover logo",
        description: error.message || "Ocorreu um erro ao remover o logo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    logoUrl,
    isUploading,
    uploadProgress,
    checkBucket,
    handleFileUpload,
    handleRemoveLogo
  };
};
