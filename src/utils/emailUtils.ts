
import { supabase } from '@/lib/supabase';

export interface EmailBudgetData {
  budgetId: string;
  clientEmail: string;
  budgetData: any;
}

export const sendBudgetByEmail = async (data: EmailBudgetData) => {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-budget-email', {
      body: {
        budgetId: data.budgetId,
        clientEmail: data.clientEmail,
        budget: data.budgetData
      }
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Erro ao enviar email: ' + error.message);
    }

    return result;
  } catch (error) {
    console.error('Unexpected error sending email:', error);
    throw error;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
