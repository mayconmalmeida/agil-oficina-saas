
import React from 'react';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';

interface WorkshopStatsProps {
  workshop: WorkshopDetails;
}

const WorkshopStats = ({ workshop }: WorkshopStatsProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Estatísticas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Orçamentos</div>
          <div className="font-bold text-2xl">{workshop.quote_count}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Clientes</div>
          <div className="font-bold text-2xl">-</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Produtos/Serviços</div>
          <div className="font-bold text-2xl">-</div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopStats;
