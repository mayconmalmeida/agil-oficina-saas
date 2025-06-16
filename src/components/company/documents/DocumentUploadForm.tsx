
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DocumentUploadFormProps {
  onUpload: (file: File, name: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onUpload,
  isUploading,
  uploadProgress
}) => {
  const [documentName, setDocumentName] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files[0] || !documentName.trim()) {
      return;
    }
    
    const file = files[0];
    await onUpload(file, documentName);
    setDocumentName('');
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="document-name">Nome do documento</Label>
          <Input 
            id="document-name"
            placeholder="Ex: Alvará de Funcionamento" 
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            disabled={isUploading}
            className="mt-1"
          />
        </div>
        
        <div className="flex items-end space-x-2">
          <div className="flex-grow">
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('document-upload')?.click()}
              disabled={isUploading || !documentName.trim()}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Selecionar arquivo
                </>
              )}
            </Button>
            
            <input 
              type="file"
              id="document-upload"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.png"
              disabled={isUploading}
            />
          </div>
        </div>
      </div>
      
      {uploadProgress > 0 && (
        <div className="mt-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-center mt-1">{uploadProgress}%</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadForm;
