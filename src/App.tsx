import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useToast } from '@/hooks/use-toast';

import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UserDashboard from './pages/Dashboard';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ClientsPage from './pages/ClientsPage';
import ServicesPage from './pages/ServicesPage';
import NewBudgetPage from './pages/NewBudgetPage';
import ProfileEditPage from './pages/ProfileEditPage';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/onboarding/profile" element={<ProfileSetupPage />} />
        <Route path="/onboarding/clientes" element={<ClientsPage />} />
        <Route path="/onboarding/produtos-servicos" element={<ServicesPage />} />
        <Route path="/onboarding/orcamento" element={<NewBudgetPage />} />
        <Route path="/perfil/editar" element={<ProfileEditPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
