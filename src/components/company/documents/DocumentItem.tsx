
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2 } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface DocumentItemProps {
  document: Document;
  onRemove: (document: Document) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
      <div className="flex items-center">
        <FileText className="h-5 w-5 text-blue-500 mr-2" />
        <div>
          <h4 className="font-medium">{document.name}</h4>
          <p className="text-xs text-gray-500">
            Adicionado em {new Date(document.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          size="icon" 
          variant="outline"
          asChild
        >
          <a href={document.url} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </a>
        </Button>
        
        <Button 
          size="icon" 
          variant="destructive"
          onClick={() => onRemove(document)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remover</span>
        </Button>
      </div>
    </div>
  );
};

export default DocumentItem;
