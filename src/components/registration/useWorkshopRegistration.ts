
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { WorkshopRegistrationFormValues } from './workshopRegistrationSchema';

export function useWorkshopRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: WorkshopRegistrationFormValues, selectedPlan: string) => {
    setIsLoading(true);
    try {
      // 1. Create user authentication with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.responsiblePerson,
            document_type: data.documentType,
            document_number: data.documentNumber,
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }

      // 2. Upload logo if provided
      let logoUrl = null;
      if (data.logo instanceof File) {
        const fileName = `${authData.user.id}/logo.${data.logo.name.split('.').pop()}`;

        // Check if bucket exists or create it
        try {
          const { data: bucketData } = await supabase.storage.getBucket('logos');
          if (!bucketData) {
            await supabase.storage.createBucket('logos', {
              public: true,
              fileSizeLimit: 5 * 1024 * 1024,
            });
          }
        } catch (error) {
          console.error("Error with logo bucket:", error);
        }

        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('logos')
          .upload(fileName, data.logo, {
            upsert: true,
            contentType: data.logo.type,
          });

        if (uploadError) {
          console.error("Logo upload error:", uploadError);
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('logos')
            .getPublicUrl(fileName);
          logoUrl = publicUrl;
        }
      }

      // Prepare trial end date
      const selectedPlanValue = "Premium";
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      // 3. Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome_oficina: data.businessName,
          telefone: data.phone,
          endereco: data.address,
          cidade: data.city,
          estado: data.state,
          cep: data.zipCode,
          cnpj: data.documentType === 'CNPJ' ? data.documentNumber : null,
          inscricao_estadual: data.stateRegistration,
          responsavel: data.responsiblePerson,
          plano: selectedPlanValue,
          logo_url: logoUrl,
          is_active: true,
          trial_ends_at: trialEndDate.toISOString(),
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // 4. Create onboarding status
      try {
        await supabase
          .from('onboarding_status')
          .insert([{ user_id: authData.user.id, profile_completed: true }]);
      } catch (error) {
        console.error("Error creating onboarding status:", error);
      }

      // 5. Create a trial subscription
      try {
        await supabase.rpc('create_subscription', {
          user_id: authData.user.id,
          plan_type: selectedPlan.toLowerCase(),
          start_date: new Date().toISOString(),
          end_date: trialEndDate.toISOString()
        });
      } catch (error) {
        console.error("Error creating subscription:", error);
      }

      // Mensagem de sucesso
      toast({
        title: "Cadastro realizado com sucesso!",
        description:
          "Oficina criada no sistema! Aguarde alguns segundos pelo redirecionamento. Caso não ocorra, faça login manualmente para acessar sua conta e o teste gratuito. Se não conseguir entrar imediatamente, aguarde alguns instantes e tente novamente.",
      });

      // Aguarda 3 segundos antes de tentar login automático
      setTimeout(async () => {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          console.error("Error signing in:", signInError);
          navigate('/login');
        } else {
          navigate('/dashboard');
        }
      }, 3000);

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao processar o cadastro."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSubmit };
}
