
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, X, ExternalLink } from 'lucide-react';

interface PlanConfiguration {
  id: string;
  plan_type: string;
  billing_cycle: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  is_active: boolean;
  display_order: number;
  affiliate_link?: string;
}

interface PlanCardProps {
  plan: PlanConfiguration;
  onEdit: (plan: PlanConfiguration) => void;
  onDelete: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onDelete }) => {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{plan.name}</h3>
            <Badge variant={plan.is_active ? "default" : "secondary"}>
              {plan.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            {plan.plan_type} - {plan.billing_cycle}
          </p>
          <p className="text-lg font-bold text-green-600">
            R$ {plan.price.toFixed(2)}
          </p>
          {plan.affiliate_link && (
            <div className="flex items-center gap-2 mt-2">
              <ExternalLink className="h-4 w-4 text-blue-500" />
              <a 
                href={plan.affiliate_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Link de Afiliado
              </a>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(plan)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onDelete(plan.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <strong>Recursos:</strong> {plan.features.join(', ')}
      </div>
    </div>
  );
};

export default PlanCard;
