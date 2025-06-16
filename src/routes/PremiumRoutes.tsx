
import React from 'react';
import { Route } from 'react-router-dom';
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';
import IntegracaoContabilPage from '@/pages/IntegracaoContabilPage';
import IADiagnosticoPage from '@/pages/IADiagnosticoPage';
import IASuporteInteligentePage from '@/pages/IASuporteInteligentePage';
import BackupPage from '@/pages/BackupPage';
import SuportePage from '@/pages/SuportePage';

const PremiumRoutes = () => {
  return (
    <>
      <Route 
        path="integracao-contabil" 
        element={
          <SubscriptionGuard requiredPlan="premium">
            <IntegracaoContabilPage />
          </SubscriptionGuard>
        } 
      />
      <Route 
        path="ia-diagnostico" 
        element={
          <SubscriptionGuard requiredPlan="premium">
            <IADiagnosticoPage />
          </SubscriptionGuard>
        } 
      />
      <Route 
        path="ia-suporte-inteligente" 
        element={
          <SubscriptionGuard requiredPlan="premium">
            <IASuporteInteligentePage />
          </SubscriptionGuard>
        } 
      />
      <Route 
        path="backup" 
        element={
          <SubscriptionGuard requiredPlan="premium">
            <BackupPage />
          </SubscriptionGuard>
        } 
      />
      <Route 
        path="suporte" 
        element={
          <SubscriptionGuard requiredPlan="premium">
            <SuportePage />
          </SubscriptionGuard>
        } 
      />
    </>
  );
};

export default PremiumRoutes;
