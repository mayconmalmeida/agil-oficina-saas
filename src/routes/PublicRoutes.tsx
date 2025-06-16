
import React from 'react';
import { Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';

const PublicRoutes = () => {
  return (
    <>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Profile Setup Route - Semi-protected (requires auth but not complete profile) */}
      <Route path="/perfil-setup" element={<ProfileSetupPage />} />
    </>
  );
};

export default PublicRoutes;
