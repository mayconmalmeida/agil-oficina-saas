
import React, { useRef } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from '../profileSchema';

interface LogoUploadSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  isLoading?: boolean;
  isSuccess?: boolean;
}

const LogoUploadSection: React.FC<LogoUploadSectionProps> = ({ form, isLoading, isSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoUrl = form.watch('logo_url');

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Por enquanto, vamos apenas mostrar que o arquivo foi selecionado
      // Em uma implementação real, você faria o upload aqui
      console.log('Arquivo selecionado:', file.name);
      form.setValue('logo_url', `placeholder-url-${file.name}`);
    }
  };

  const handleRemoveLogo = () => {
    form.setValue('logo_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Logo da Oficina</h3>
      
      <FormField
        control={form.control}
        name="logo_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo da empresa</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {logoUrl ? (
                  <div className="flex items-center justify-between p-4 border rounded-md bg-gray-50">
                    <span className="text-sm text-gray-600">Logo selecionado</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Faça upload do logo da sua oficina</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleFileSelect}
                        disabled={isLoading}
                      >
                        Selecionar arquivo
                      </Button>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500">
                  Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                </p>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default LogoUploadSection;
