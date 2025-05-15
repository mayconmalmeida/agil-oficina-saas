
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Trash2 } from 'lucide-react';

interface LogoActionsProps {
  logoUrl: string | null;
  isUploading: boolean;
  onUpload: () => void;
  onRemove: () => void;
}

const LogoActions: React.FC<LogoActionsProps> = ({ 
  logoUrl, 
  isUploading, 
  onUpload, 
  onRemove 
}) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Gerenciar Logo</h3>
      
      <div className="space-y-3">
        <Button 
          variant="outline" 
          onClick={onUpload}
          disabled={isUploading}
          className="w-full justify-start"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Enviando...' : 'Carregar novo logo'}
        </Button>
        
        {logoUrl && (
          <Button 
            variant="destructive" 
            onClick={onRemove}
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
    </div>
  );
};

export default LogoActions;
