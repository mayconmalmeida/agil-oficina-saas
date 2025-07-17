
import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';

interface WorkshopSubscriptionInfoProps {
  workshop: WorkshopDetails;
}

const WorkshopSubscriptionInfo = ({ workshop }: WorkshopSubscriptionInfoProps) => {
  // Função para determinar o status da assinatura
  const getSubscriptionStatus = () => {
    if (!workshop.subscription) {
      return { text: 'Sem assinatura', color: 'text-gray-600' };
    }

    const now = new Date();
    const subscription = workshop.subscription;

    if (subscription.status === 'active') {
      if (subscription.ends_at) {
        const endsAt = new Date(subscription.ends_at);
        if (endsAt > now) {
          return { text: 'Ativo', color: 'text-green-600' };
        } else {
          return { text: 'Expirado', color: 'text-red-600' };
        }
      } else {
        return { text: 'Ativo (Indefinido)', color: 'text-green-600' };
      }
    } else if (subscription.status === 'trialing') {
      if (subscription.trial_ends_at) {
        const trialEndsAt = new Date(subscription.trial_ends_at);
        if (trialEndsAt > now) {
          return { text: 'Em Teste', color: 'text-blue-600' };
        } else {
          return { text: 'Teste Expirado', color: 'text-red-600' };
        }
      }
    }

    return { text: 'Inativo', color: 'text-red-600' };
  };

  // Função para obter a data de vencimento correta
  const getExpirationDate = () => {
    if (!workshop.subscription) return null;

    const subscription = workshop.subscription;
    
    if (subscription.status === 'trialing' && subscription.trial_ends_at) {
      return subscription.trial_ends_at;
    } else if (subscription.status === 'active' && subscription.ends_at) {
      return subscription.ends_at;
    }
    
    return null;
  };

  // Função para obter o nome do plano
  const getPlanName = () => {
    if (!workshop.subscription) return 'Nenhum';
    
    const planType = workshop.subscription.plan_type;
    if (planType.includes('premium')) {
      return 'Premium';
    } else if (planType.includes('essencial')) {
      return 'Essencial';
    }
    
    return 'Desconhecido';
  };

  const subscriptionStatus = getSubscriptionStatus();
  const expirationDate = getExpirationDate();

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Status da assinatura</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-gray-500">Plano</div>
          <div className="font-medium">
            {getPlanName()}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Status</div>
          <div className={`font-medium ${subscriptionStatus.color}`}>
            {subscriptionStatus.text}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Data de cadastro</div>
          <div>
            {workshop.created_at 
              ? format(new Date(workshop.created_at), 'dd/MM/yyyy', { locale: ptBR }) 
              : 'N/A'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Vencimento</div>
          <div>
            {expirationDate 
              ? format(new Date(expirationDate), 'dd/MM/yyyy', { locale: ptBR }) 
              : 'Sem vencimento'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopSubscriptionInfo;
