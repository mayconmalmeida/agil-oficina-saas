
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from 'lucide-react';

interface PremiumUpgradeCardProps {
  onLogout: () => void;
}

const PremiumUpgradeCard: React.FC<PremiumUpgradeCardProps> = ({ onLogout }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <CardTitle className="text-xl text-gray-900">
            Recurso Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Esta funcionalidade está disponível apenas para usuários do plano Premium.
          </p>
          <div className="space-y-2">
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => window.open('https://pay.cakto.com.br/premium-mensal', '_blank')}
            >
              Upgrade para Premium Mensal - R$ 179,90/mês
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://pay.cakto.com.br/premium-anual', '_blank')}
            >
              Premium Anual - R$ 1.799,00/ano (2 meses grátis)
            </Button>
          </div>
          <Button 
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-800"
            onClick={onLogout}
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumUpgradeCard;
