
import { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { AuthUser } from '@/types/auth';
import { useAuthSessionListener } from './useAuthSessionListener';
import { useUserProfileData } from './useUserProfileData';

export const useAuthState = () => {
  const { session, user } = useAuthSessionListener();
  const { profile, loading, role } = useUserProfileData(user);

  // isLoadingAuth: loading profile ou carregando sessão
  const isLoadingAuth = loading || (typeof window !== 'undefined' && !session);

  return {
    user: profile,
    session,
    loading,
    isLoadingAuth,
    role
  };
};
