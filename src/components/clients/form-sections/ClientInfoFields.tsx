
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import ClientTypeSelector from './ClientTypeSelector';
import ClientNameField from './ClientNameField';
import DocumentField from './DocumentField';

interface ClientInfoFieldsProps {
  form: UseFormReturn<any>;
  saveSuccess: boolean;
}

const ClientInfoFields: React.FC<ClientInfoFieldsProps> = ({ form, saveSuccess }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium mb-3">Dados do Cliente</h3>
      
      <ClientTypeSelector form={form} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClientNameField form={form} saveSuccess={saveSuccess} />
        <DocumentField form={form} saveSuccess={saveSuccess} />
      </div>
    </div>
  );
};

export default ClientInfoFields;
