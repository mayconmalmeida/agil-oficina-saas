
import React, { useState } from 'react';
import { Form } from '@/components/ui/form';
import { CardContent } from '@/components/ui/card';
import ProfileFormField from './ProfileFormField';
import ProfileSubmitButton from './ProfileSubmitButton';
import { useProfileForm } from '@/hooks/useProfileForm';
import { formatPhoneNumber } from '@/utils/formatUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditFormProps {
  userId: string | undefined;
  onSaveSuccess: () => void;
  initialValues?: {
    nome_oficina?: string;
    telefone?: string;
    logo_url?: string;
  };
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  userId, 
  onSaveSuccess,
  initialValues = { nome_oficina: '', telefone: '', logo_url: '' }
}) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialValues.logo_url || null);
  const { toast } = useToast();
  
  const { form, isLoading, saveSuccess, onSubmit: originalOnSubmit } = useProfileForm({
    userId,
    onSaveSuccess,
    initialValues
  });
  
  const onSubmit = async (values: any) => {
    // Inclui a logoUrl no formulário
    await originalOnSubmit({
      ...values,
      logo_url: logoUrl
    });
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !userId) {
      return;
    }
    
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
      });
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Verificar se o bucket existe
      const { data: bucketExists } = await supabase
        .storage
        .getBucket('logos');
        
      if (!bucketExists) {
        // Se não existir, tentar criar
        toast({
          title: "Criando área de armazenamento",
          description: "Configurando o armazenamento para logos...",
        });
      }
      
      // Upload do arquivo para o storage
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          },
        });
        
      if (error) {
        throw error;
      }
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(data.path);
        
      setLogoUrl(publicUrl);
      
      toast({
        title: "Upload concluído",
        description: "Logo carregada com sucesso.",
      });
      
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao carregar o arquivo.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };
  
  return (
    <CardContent>
      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-24 h-24 border-2 border-oficina mb-2">
          {logoUrl ? (
            <AvatarImage src={logoUrl} alt="Logo da oficina" />
          ) : (
            <AvatarFallback className="text-2xl bg-oficina text-white">
              {initialValues.nome_oficina?.substring(0, 2) || "OF"}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="mt-2">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('logo-upload')?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            {uploading ? 'Enviando...' : 'Carregar logo'}
          </Button>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>
        
        {uploadProgress !== null && (
          <div className="w-full mt-2">
            <Progress value={uploadProgress} className="h-1" />
            <p className="text-xs text-center mt-1">{uploadProgress}%</p>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ProfileFormField 
            form={form}
            name="nome_oficina"
            label="Nome da Oficina"
            placeholder="Auto Center São Paulo"
            disabled={isLoading || uploading}
            isSuccess={saveSuccess}
          />
          
          <ProfileFormField 
            form={form}
            name="telefone"
            label="Telefone"
            placeholder="(11) 99999-9999"
            disabled={isLoading || uploading}
            isSuccess={saveSuccess}
            formatValue={formatPhoneNumber}
          />
          
          <ProfileSubmitButton 
            isLoading={isLoading || uploading} 
            saveSuccess={saveSuccess} 
          />
        </form>
      </Form>
    </CardContent>
  );
};

export default ProfileEditForm;
