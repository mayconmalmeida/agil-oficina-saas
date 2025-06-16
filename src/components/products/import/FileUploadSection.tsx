
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileUploadSectionProps {
  file: File | null;
  isProcessing: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcess: () => void;
  onCancel: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  file,
  isProcessing,
  onFileChange,
  onProcess,
  onCancel
}) => {
  return (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="xml-file">Arquivo XML da NFC-e</Label>
          <Input
            id="xml-file"
            type="file"
            accept=".xml"
            onChange={onFileChange}
            className="mt-1"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Arquivo selecionado: {file.name}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onProcess} disabled={!file || isProcessing}>
          {isProcessing ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Processar Nota
            </>
          )}
        </Button>
      </div>
    </>
  );
};

export default FileUploadSection;
