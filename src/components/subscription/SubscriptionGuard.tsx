
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from '@/hooks/useSubscription';
import { AlertTriangle, Crown, CheckCircle } from 'lucide-react';
import Loading from '@/components/ui/loading';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: 'essencial' | 'premium';
  fallback?: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  requiredPlan,
  fallback 
}) => {
  const { subscriptionStatus, loading } = useSubscription();

  if (loading) {
    return <Loading fullscreen text="Verificando assinatura..." />;
  }

  // Se o usuário tem acesso geral às funcionalidades
  if (subscriptionStatus.canAccessFeatures) {
    // Se não há requisito específico de plano, permitir acesso
    if (!requiredPlan) {
      return <>{children}</>;
    }
    
    // Se há requisito específico, verificar se o usuário tem o plano adequado
    if (requiredPlan === 'premium' && !subscriptionStatus.isPremium) {
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
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return <>{children}</>;
  }

  // Se não tem acesso, mostrar tela de bloqueio
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-gray-900">
            {subscriptionStatus.hasSubscription ? 'Assinatura Expirada' : 'Acesso Restrito'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {subscriptionStatus.hasSubscription ? (
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
            {/* Plano Essencial */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Plano Essencial</h3>
                <p className="text-sm text-gray-500">Para oficinas de pequeno porte</p>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">R$ 89,90</div>
                  <div className="text-sm text-gray-500">por mês</div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Cadastro de clientes ilimitado</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Gestão de orçamentos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Controle de serviços</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Relatórios básicos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Suporte via e-mail</span>
                  </li>
                </ul>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => window.open('https://pay.cakto.com.br/essencial-mensal', '_blank')}
                  >
                    Assinar Mensal
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://pay.cakto.com.br/essencial-anual', '_blank')}
                  >
                    Anual - R$ 899,00 (2 meses grátis)
                  </Button>
                </div>
              </div>
            </div>

            {/* Plano Premium */}
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-4 relative">
              <div className="absolute -top-3 right-4 bg-amber-600 text-white text-xs px-3 py-1 rounded-full">
                RECOMENDADO
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Plano Premium</h3>
                <p className="text-sm text-gray-500">Para oficinas em crescimento</p>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">R$ 179,90</div>
                  <div className="text-sm text-gray-500">por mês</div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center font-medium">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Tudo do plano Essencial, mais:</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Módulo de estoque integrado</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Agendamento de serviços</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Backup automático</span>
                  </li>
                </ul>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    onClick={() => window.open('https://pay.cakto.com.br/premium-mensal', '_blank')}
                  >
                    Assinar Mensal
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-amber-200 text-amber-700 hover:bg-amber-100"
                    onClick={() => window.open('https://pay.cakto.com.br/premium-anual', '_blank')}
                  >
                    Anual - R$ 1.799,00 (2 meses grátis)
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Dúvidas? Entre em contato conosco pelo e-mail: suporte@oficinaagil.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionGuard;
