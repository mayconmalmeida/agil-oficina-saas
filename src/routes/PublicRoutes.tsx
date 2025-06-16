
import React from 'react';
import { Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';

const PublicRoutes = () => {
  return (
    <>
      <Route
        path="/"
        element={
          <AuthProvider>
            <HomePage />
          </AuthProvider>
        }
      />
      <Route
        path="/login"
        element={
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        }
      />
      <Route
        path="/register"
        element={
          <AuthProvider>
            <RegisterPage />
          </AuthProvider>
        }
      />
      
      {/* Profile Setup Route - Semi-protected (requires auth but not complete profile) */}
      <Route
        path="/perfil-setup"
        element={
          <AuthProvider>
            <ProfileSetupPage />
          </AuthProvider>
        }
      />
    </>
  );
};

export default PublicRoutes;
