
import React from 'react';
import { Route } from 'react-router-dom';
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';
import IntegracaoContabilPage from '@/pages/IntegracaoContabilPage';
import IADiagnosticoPage from '@/pages/IADiagnosticoPage';
import IASuporteInteligentePage from '@/pages/IASuporteInteligentePage';
import BackupPage from '@/pages/BackupPage';
import SuportePage from '@/pages/SuportePage';

export const premiumRoutes = [
  <Route 
    key="integracao-contabil"
    path="integracao-contabil" 
    element={
      <SubscriptionGuard requiredPlan="premium">
        <IntegracaoContabilPage />
      </SubscriptionGuard>
    } 
  />,
  <Route 
    key="ia-diagnostico"
    path="ia-diagnostico" 
    element={
      <SubscriptionGuard requiredPlan="premium">
        <IADiagnosticoPage />
      </SubscriptionGuard>
    } 
  />,
  <Route 
    key="ia-suporte-inteligente"
    path="ia-suporte-inteligente" 
    element={
      <SubscriptionGuard requiredPlan="premium">
        <IASuporteInteligentePage />
      </SubscriptionGuard>
    } 
  />,
  <Route 
    key="backup"
    path="backup" 
    element={
      <SubscriptionGuard requiredPlan="premium">
        <BackupPage />
      </SubscriptionGuard>
    } 
  />,
  <Route 
    key="suporte"
    path="suporte" 
    element={
      <SubscriptionGuard requiredPlan="premium">
        <SuportePage />
      </SubscriptionGuard>
    } 
  />
];
