
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { checkSubscriptionStatus } = useStripeSubscription();
  const [verifying, setVerifying] = useState(true);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "ID da sessão não encontrado."
        });
        navigate('/');
        return;
      }

      try {
        // Wait a bit for Stripe to process the payment
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check subscription status
        await checkSubscriptionStatus();
        
        toast({
          title: "Pagamento realizado com sucesso!",
          description: "Sua assinatura foi ativada. Bem-vindo ao OficinaÁgil!"
        });
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        toast({
          variant: "destructive",
          title: "Erro na verificação",
          description: "Houve um problema ao verificar seu pagamento. Entre em contato conosco."
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, checkSubscriptionStatus, toast, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Verificando pagamento...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Aguarde enquanto confirmamos seu pagamento e ativamos sua assinatura.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Pagamento Confirmado!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Parabéns! Sua assinatura do OficinaÁgil foi ativada com sucesso.
          </p>
          <p className="text-sm text-gray-500">
            Você já pode começar a usar todos os recursos do seu plano.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Ir para o Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
