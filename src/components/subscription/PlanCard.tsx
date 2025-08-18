
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

interface PlanCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
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
  monthlyUrl,
  annualUrl,
  annualPrice
}) => {
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4 relative">
      <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
        PREMIUM
      </div>
      
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
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="space-y-2">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => window.open(monthlyUrl, '_blank')}
          >
            Assinar Mensal
          </Button>
          <Button 
            variant="outline"
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-100"
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
