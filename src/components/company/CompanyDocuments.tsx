
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DocumentUploadForm from './documents/DocumentUploadForm';
import DocumentsList from './documents/DocumentsList';
import { useDocumentManagement } from '@/hooks/useDocumentManagement';

interface Document {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface CompanyDocumentsProps {
  documents: Document[];
  userId: string;
  onSave: () => void;
}

const CompanyDocuments: React.FC<CompanyDocumentsProps> = ({ 
  documents: initialDocuments, 
  userId, 
  onSave 
}) => {
  const {
    documents,
    isUploading,
    uploadProgress,
    uploadDocument,
    removeDocument
  } = useDocumentManagement(initialDocuments, userId, onSave);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-gray-600">
          Faça upload de documentos importantes para sua oficina como certificações, licenças, alvarás, etc.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <DocumentUploadForm
            onUpload={uploadDocument}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">Documentos salvos</h3>
            <DocumentsList
              documents={documents}
              onRemoveDocument={removeDocument}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDocuments;
