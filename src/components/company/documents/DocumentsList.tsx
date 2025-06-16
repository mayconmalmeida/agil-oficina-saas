
import React from 'react';
import { FileText } from 'lucide-react';
import DocumentItem from './DocumentItem';

interface Document {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface DocumentsListProps {
  documents: Document[];
  onRemoveDocument: (document: Document) => void;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ documents, onRemoveDocument }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <FileText className="mx-auto h-8 w-8 opacity-50" />
        <p className="mt-2">Nenhum documento salvo</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <DocumentItem 
          key={doc.id}
          document={doc}
          onRemove={onRemoveDocument}
        />
      ))}
    </div>
  );
};

export default DocumentsList;
