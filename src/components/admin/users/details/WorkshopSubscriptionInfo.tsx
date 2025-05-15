
import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';

interface WorkshopSubscriptionInfoProps {
  workshop: WorkshopDetails;
}

const WorkshopSubscriptionInfo = ({ workshop }: WorkshopSubscriptionInfoProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Status da assinatura</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-gray-500">Plano</div>
          <div className="font-medium">
            {workshop.plano === 'premium' ? 'Premium' : 'Essencial'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Status</div>
          <div className={`font-medium ${workshop.is_active ? 'text-green-600' : 'text-red-600'}`}>
            {workshop.is_active ? 'Ativo' : 'Desativado'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Data de cadastro</div>
          <div>
            {workshop.created_at 
              ? format(new Date(workshop.created_at), 'dd/MM/yyyy', { locale: ptBR }) 
              : 'N/A'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Vencimento</div>
          <div>
            {workshop.trial_ends_at 
              ? format(new Date(workshop.trial_ends_at), 'dd/MM/yyyy', { locale: ptBR }) 
              : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopSubscriptionInfo;
