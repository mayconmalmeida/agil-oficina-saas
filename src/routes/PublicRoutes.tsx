
import React from 'react';
import { Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

export const publicRoutes = [
  <Route key="home" path="/home" element={<HomePage />} />,
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="register" path="/register" element={<RegisterPage />} />,
  <Route key="profile-setup" path="/perfil-setup" element={<ProfileSetupPage />} />,
  <Route key="forgot-password" path="/esqueceu-senha" element={<ForgotPasswordPage />} />
];
