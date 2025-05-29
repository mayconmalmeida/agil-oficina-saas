
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut } from 'lucide-react';
import PlanCard from './PlanCard';

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
                Seu período de teste expirou. Para continuar usando o OficinaÁgil, 
                escolha um dos nossos planos abaixo:
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                Para acessar o sistema, você precisa de uma assinatura ativa. 
                Escolha o plano ideal para sua oficina:
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <PlanCard
              title="Plano Essencial"
              description="Para oficinas de pequeno porte"
              price="R$ 89,90"
              period="por mês"
              features={[
                'Cadastro de clientes ilimitado',
                'Gestão de orçamentos',
                'Controle de serviços',
                'Relatórios básicos',
                'Suporte via e-mail'
              ]}
              monthlyUrl="https://pay.cakto.com.br/essencial-mensal"
              annualUrl="https://pay.cakto.com.br/essencial-anual"
              annualPrice="Anual - R$ 899,00 (2 meses grátis)"
            />

            <PlanCard
              title="Plano Premium"
              description="Para oficinas em crescimento"
              price="R$ 179,90"
              period="por mês"
              features={[
                'Tudo do plano Essencial, mais:',
                'Módulo de estoque integrado',
                'Agendamento de serviços',
                'Relatórios avançados',
                'Suporte prioritário',
                'Backup automático'
              ]}
              isPremium
              monthlyUrl="https://pay.cakto.com.br/premium-mensal"
              annualUrl="https://pay.cakto.com.br/premium-anual"
              annualPrice="Anual - R$ 1.799,00 (2 meses grátis)"
            />
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Dúvidas? Entre em contato conosco pelo e-mail: suporte@oficinaagil.com
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
