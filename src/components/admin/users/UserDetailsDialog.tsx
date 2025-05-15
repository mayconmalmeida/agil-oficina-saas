
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Workshop } from '@/components/admin/UsersTable';
import WorkshopGeneralInfo from './details/WorkshopGeneralInfo';
import WorkshopAddressInfo from './details/WorkshopAddressInfo';
import WorkshopSubscriptionInfo from './details/WorkshopSubscriptionInfo';
import WorkshopStats from './details/WorkshopStats';
import WorkshopActionButtons from './details/WorkshopActionButtons';

// Extended Workshop type with address details
export type WorkshopDetails = Workshop & {
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
};

interface UserDetailsDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  selectedWorkshop: WorkshopDetails | null;
  onEdit: (workshop: WorkshopDetails) => void;
  onChangePlan: (workshop: WorkshopDetails) => void;
  onRenewSubscription: (workshop: WorkshopDetails) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onGeneratePDF: (workshop: WorkshopDetails) => void;
}

const UserDetailsDialog = ({
  showDialog,
  setShowDialog,
  selectedWorkshop,
  onEdit,
  onChangePlan,
  onRenewSubscription,
  onToggleStatus,
  onGeneratePDF
}: UserDetailsDialogProps) => {
  if (!selectedWorkshop) return null;
  
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Oficina</DialogTitle>
        </DialogHeader>
        
        {selectedWorkshop && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WorkshopGeneralInfo workshop={selectedWorkshop} />
              <WorkshopAddressInfo workshop={selectedWorkshop} />
            </div>
            
            <WorkshopSubscriptionInfo workshop={selectedWorkshop} />
            <WorkshopStats workshop={selectedWorkshop} />
            
            <WorkshopActionButtons 
              workshop={selectedWorkshop}
              onEdit={onEdit}
              onChangePlan={onChangePlan}
              onRenewSubscription={onRenewSubscription}
              onToggleStatus={onToggleStatus}
              onGeneratePDF={onGeneratePDF}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
