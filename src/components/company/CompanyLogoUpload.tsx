
import React, { useEffect, useRef } from 'react';
import LogoPreview from './logo/LogoPreview';
import LogoActions from './logo/LogoActions';
import LogoTips from './logo/LogoTips';
import { useLogoUpload } from '@/hooks/useLogoUpload';

interface CompanyLogoUploadProps {
  initialLogo: string | null;
  userId: string;
  onSave: () => void;
}

const CompanyLogoUpload: React.FC<CompanyLogoUploadProps> = ({ initialLogo, userId, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    logoUrl, 
    isUploading, 
    uploadProgress, 
    checkBucket, 
    handleFileUpload, 
    handleRemoveLogo 
  } = useLogoUpload({ userId, initialLogo, onSave });
  
  useEffect(() => {
    checkBucket();
  }, [userId]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
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
        <LogoPreview 
          logoUrl={logoUrl} 
          uploadProgress={uploadProgress} 
        />
        
        <div>
          <LogoActions 
            logoUrl={logoUrl}
            isUploading={isUploading}
            onUpload={handleUploadClick}
            onRemove={handleRemoveLogo}
          />
          
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
          />
          
          <LogoTips />
        </div>
      </div>
    </div>
  );
};

export default CompanyLogoUpload;
