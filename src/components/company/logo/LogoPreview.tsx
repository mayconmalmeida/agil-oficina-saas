
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LogoPreviewProps {
  logoUrl: string | null;
  uploadProgress: number;
}

const LogoPreview: React.FC<LogoPreviewProps> = ({ logoUrl, uploadProgress }) => {
  return (
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
  );
};

export default LogoPreview;
