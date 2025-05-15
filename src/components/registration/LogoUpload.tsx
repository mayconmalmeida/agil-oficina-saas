
import React, { useState } from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Image, Upload, X } from 'lucide-react';

interface LogoUploadProps {
  onChange: (file: File | null) => void;
  value: File | null;
  error?: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ onChange, value, error }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Check if file is JPG or PNG
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Apenas arquivos JPG e PNG são aceitos');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full max-w-[200px] aspect-video border rounded-md overflow-hidden">
          <img 
            src={preview} 
            alt="Logo preview" 
            className="w-full h-full object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full max-w-[200px] aspect-video border-2 border-dashed rounded-md border-gray-300 p-4">
          <div className="flex flex-col items-center">
            <Image className="mb-2 w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-500">JPG ou PNG</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center">
        <input
          id="logo-upload"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('logo-upload')?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {preview ? 'Trocar Logo' : 'Selecionar Logo'}
        </Button>
      </div>
      
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
};

export default LogoUpload;
