
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { CreditCard } from 'lucide-react';

interface StripeCheckoutButtonProps {
  userId: string;
  planType: string;
  disabled?: boolean;
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  userId,
  planType,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStripeCheckout = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          user_id: userId,
          plan_type: planType
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error: any) {
      console.error('Erro ao criar checkout Stripe:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível criar o checkout do Stripe"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStripeCheckout}
      disabled={disabled || loading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <CreditCard className="h-4 w-4" />
      {loading ? 'Criando...' : 'Pagar com Stripe'}
    </Button>
  );
};

export default StripeCheckoutButton;
