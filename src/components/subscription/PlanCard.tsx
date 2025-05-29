
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

interface PlanCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  isPremium?: boolean;
  monthlyUrl: string;
  annualUrl: string;
  annualPrice: string;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  price,
  period,
  features,
  isPremium = false,
  monthlyUrl,
  annualUrl,
  annualPrice
}) => {
  const cardClass = isPremium 
    ? "border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-4 relative"
    : "border rounded-lg p-4 space-y-4";

  return (
    <div className={cardClass}>
      {isPremium && (
        <div className="absolute -top-3 right-4 bg-amber-600 text-white text-xs px-3 py-1 rounded-full">
          RECOMENDADO
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      
      <div className="space-y-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{price}</div>
          <div className="text-sm text-gray-500">{period}</div>
        </div>
        
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className={index === 0 && isPremium ? "font-medium" : ""}>{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="space-y-2">
          <Button 
            className={isPremium ? "w-full bg-amber-600 hover:bg-amber-700" : "w-full"}
            onClick={() => window.open(monthlyUrl, '_blank')}
          >
            Assinar Mensal
          </Button>
          <Button 
            variant="outline"
            className={isPremium ? "w-full border-amber-200 text-amber-700 hover:bg-amber-100" : "w-full"}
            onClick={() => window.open(annualUrl, '_blank')}
          >
            {annualPrice}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
