
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { safeRpc } from '@/utils/supabaseTypes';

/**
 * Hook to ensure necessary database schema updates are applied
 */
export const useEnsureDatabaseSchema = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const ensureSchema = async () => {
      try {
        // Check for whatsapp_suporte column in profiles table
        const { error: columnError } = await safeRpc('ensure_whatsapp_suporte_column', {});
        
        if (columnError) {
          console.error('Error ensuring database schema:', columnError);
          setError(columnError.message);
        } else {
          console.log('Database schema verified successfully');
        }
      } catch (err: any) {
        console.error('Unexpected error ensuring database schema:', err);
        setError(err.message || 'Unknown error updating database schema');
      } finally {
        setIsReady(true);
      }
    };
    
    ensureSchema();
  }, []);
  
  return { isReady, error };
};
