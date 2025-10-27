
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut } from 'lucide-react';
import PlanCard from './PlanCard';
import { ASAAS_MONTHLY_URL, ASAAS_ANNUAL_URL, CHECKOUT_PROVIDER } from '@/config/checkout';

interface SubscriptionExpiredCardProps {
  hasSubscription: boolean;
  onLogout: () => void;
}

const SubscriptionExpiredCard: React.FC<SubscriptionExpiredCardProps> = ({ 
  hasSubscription, 
  onLogout 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-gray-900">
            {hasSubscription ? 'Assinatura Expirada' : 'Acesso Restrito'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {hasSubscription ? (
              <p className="text-gray-600 mb-6">
                Seu período de teste expirou. Para continuar usando o OficinaGO, 
                escolha um dos nossos planos Premium abaixo:
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                Para acessar o sistema, você precisa de uma assinatura Premium ativa. 
                Escolha o plano ideal para sua oficina:
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <PlanCard
              title="Premium Mensal"
              description="Recursos completos para sua oficina, mês a mês"
              price="R$ 197,00"
              period="por mês"
              features={[
                'Acesso completo a todas as funcionalidades',
                'Suporte premium prioritário',
                'Relatórios e dashboards avançados',
                'Automação de processos e integrações'
              ]}
              monthlyUrl={ASAAS_MONTHLY_URL || 'https://pay.cakto.com.br/premium-mensal'}
              annualUrl={ASAAS_ANNUAL_URL || 'https://pay.cakto.com.br/premium-anual'}
              annualPrice="Anual - R$ 1.970,00 (2 meses grátis)"
            />

            <PlanCard
              title="Premium Anual"
              description="Economia de 17% no plano anual"
              price="R$ 1.970,00"
              period="por ano"
              features={[
                'Tudo do Premium Mensal',
                '2 meses grátis no plano anual',
                'Desconto especial de 17%',
                'Suporte prioritário garantido',
                'Treinamento personalizado',
                'Migração gratuita de dados',
                'Customizações exclusivas'
              ]}
              monthlyUrl={ASAAS_MONTHLY_URL || 'https://pay.cakto.com.br/premium-mensal'}
              annualUrl={ASAAS_ANNUAL_URL || 'https://pay.cakto.com.br/premium-anual'}
              annualPrice="Mensal - R$ 197,00"
            />
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Dúvidas? Entre em contato conosco pelo e-mail: contatooficinago@gmail.com
            </p>
            
            <Button 
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionExpiredCard;
