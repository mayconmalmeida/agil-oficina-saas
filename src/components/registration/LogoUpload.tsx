
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoUploadProps {
  value: File | null | undefined;
  onChange: (file: File | null) => void;
  error?: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ value, onChange, error }) => {
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        // If you want to handle this error, you can add custom logic here
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        // If you want to handle this error, you can add custom logic here
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Pass file to parent
      onChange(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  };
  
  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };
  
  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Logo preview" 
            className="max-h-48 rounded-md border border-gray-200" 
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-white bg-opacity-70 hover:bg-white hover:bg-opacity-100"
            onClick={handleRemove}
          >
            Remover
          </Button>
        </div>
      ) : (
        <label className={cn(
          "flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-md cursor-pointer",
          error ? "border-red-500" : "border-gray-300 hover:border-blue-500"
        )}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {error ? (
              <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            ) : (
              <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:underline">
                Clique para selecionar
              </span> ou arraste uma imagem
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG (máx. 5MB)
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
};

export default LogoUpload;
