
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedClientForm from './EnhancedClientForm';

interface ClientEditDialogProps {
  clientId: string;
  onClose: () => void;
  onSave: () => void;
}

const ClientEditDialog: React.FC<ClientEditDialogProps> = ({
  clientId,
  onClose,
  onSave
}) => {
  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <EnhancedClientForm
            onSave={handleSave}
            isEditing={true}
            clientId={clientId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientEditDialog;
