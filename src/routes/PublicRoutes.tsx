
import React from 'react';
import { Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';

export const publicRoutes = [
  <Route key="home" path="/" element={<HomePage />} />,
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="register" path="/register" element={<RegisterPage />} />,
  <Route key="profile-setup" path="/perfil-setup" element={<ProfileSetupPage />} />
];
