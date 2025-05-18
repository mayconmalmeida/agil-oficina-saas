
import React, { useEffect } from 'react';
import { useLogoUpload } from '@/hooks/useLogoUpload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface LogoSettingsSectionProps {
  userId?: string;
  initialLogo?: string | null;
}

const LogoSettingsSection: React.FC<LogoSettingsSectionProps> = ({ 
  userId, 
  initialLogo 
}) => {
  const { 
    logoUrl, 
    isUploading, 
    uploadProgress, 
    checkBucket, 
    handleFileUpload, 
    handleRemoveLogo 
  } = useLogoUpload({ 
    userId: userId || '', 
    initialLogo: initialLogo || null, 
    onSave: () => console.log('Logo saved') 
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) {
      checkBucket();
    }
  }, [userId, checkBucket]);

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
      <div>
        <h2 className="text-lg font-medium mb-2">Logo da Oficina</h2>
        <p className="text-sm text-gray-500 mb-4">
          Este logo será usado no cabeçalho do sistema e nos PDFs dos orçamentos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Visualização</CardTitle>
            <CardDescription>Como o logo aparecerá nos documentos</CardDescription>
          </CardHeader>
          <CardContent>
            {logoUrl ? (
              <div className="relative bg-gray-50 p-4 rounded-md flex items-center justify-center h-48">
                <img 
                  src={logoUrl} 
                  alt="Logo da empresa" 
                  className="max-h-40 max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md flex items-center justify-center h-48">
                <p className="text-gray-400">Nenhum logo carregado</p>
              </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <p className="text-xs text-center mt-1">{uploadProgress}% completo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Gerenciar Logo</CardTitle>
            <CardDescription>Faça upload ou remova o logo da sua oficina</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {isUploading ? 'Enviando...' : 'Selecionar arquivo de imagem'}
            </button>
            
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
              disabled={isUploading}
            />

            {logoUrl && (
              <button
                onClick={handleRemoveLogo}
                disabled={isUploading}
                className="w-full text-left px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                Remover logo
              </button>
            )}

            <div className="mt-4 text-sm text-gray-500">
              <h4 className="font-medium mb-1">Especificações:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Formatos aceitos: JPG, PNG, GIF</li>
                <li>Tamanho máximo: 5MB</li>
                <li>Dimensão recomendada: 200x100 pixels</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LogoSettingsSection;
