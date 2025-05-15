import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Progress } from '@/components/ui/progress';

interface CompanyLogoUploadProps {
  initialLogo: string | null;
  userId: string;
  onSave: () => void;
}

const CompanyLogoUpload: React.FC<CompanyLogoUploadProps> = ({ initialLogo, userId, onSave }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogo);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files[0]) return;
    
    const file = files[0];
    
    // Validation
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
      // Gera um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Simulação de progresso (já que o supabase não fornece progresso real)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 5;
          return next > 95 ? 95 : next;
        });
      }, 100);
      
      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearInterval(progressInterval);
      
      if (error) throw error;
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
      
      setUploadProgress(100);
      setLogoUrl(publicUrl);
      
      // Atualiza o perfil com o novo logo
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          logo_url: publicUrl 
        } as any)
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Upload concluído",
        description: "O logo da sua empresa foi atualizado com sucesso.",
      });
      
      onSave();
      
    } catch (error: any) {
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
    if (!logoUrl || !window.confirm('Tem certeza que deseja remover o logo?')) {
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Remove o logo do perfil
      const { error } = await supabase
        .from('profiles')
        .update({ 
          logo_url: null 
        } as any)
        .eq('id', userId);
      
      if (error) throw error;
      
      // Não removemos o arquivo do storage para manter histórico
      
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

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Faça upload do logo da sua oficina para uso em orçamentos, notas fiscais e na sua conta.
        </p>
        <p className="text-sm text-gray-500">
          Formatos aceitos: JPG, PNG ou GIF. Tamanho máximo: 5MB.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Visualização do Logo</h3>
          
          <Card className="overflow-hidden">
            {logoUrl ? (
              <div className="relative">
                <AspectRatio ratio={16/9} className="bg-gray-100">
                  <img 
                    src={logoUrl} 
                    alt="Logo da empresa" 
                    className="w-full h-full object-contain p-4"
                  />
                </AspectRatio>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100">
                <p className="text-gray-400">Nenhum logo carregado</p>
              </div>
            )}
          </Card>
          
          {uploadProgress > 0 && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center mt-1">{uploadProgress}%</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Gerenciar Logo</h3>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('logo-upload')?.click()}
              disabled={isUploading}
              className="w-full justify-start"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Enviando...' : 'Carregar novo logo'}
            </Button>
            
            <input 
              type="file"
              id="logo-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*"
              disabled={isUploading}
            />
            
            {logoUrl && (
              <Button 
                variant="destructive" 
                onClick={handleRemoveLogo}
                disabled={isUploading}
                className="w-full justify-start"
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Remover logo
              </Button>
            )}
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Dicas para um bom logo:</h4>
            <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
              <li>Use um fundo transparente para melhor visualização</li>
              <li>Tamanhos recomendados: 800x450px ou proporção similar</li>
              <li>Evite textos muito pequenos que ficam ilegíveis em impressões</li>
              <li>Prefira imagens com alta resolução para evitar pixelização</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogoUpload;
