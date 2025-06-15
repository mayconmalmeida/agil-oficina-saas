
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { WorkshopRegistrationFormValues } from './workshopRegistrationSchema';

export function useWorkshopRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // **Salvamento progressivo de perfil/oficina**
  const createOrUpdatePartialProfile = async (
    data: Partial<WorkshopRegistrationFormValues>,
    profileId: string | null,
    patchType: string
  ) => {
    // Não fazer nada se não tiver nenhum dado relevante
    if (!data || Object.keys(data).length === 0) return;
    try {
      let resp;
      if (!profileId) {
        // Criação inicial do perfil (perfil "temporário" até login final)
        resp = await supabase
          .from('profiles')
          .insert([{
            nome_oficina: data.businessName,
            cnpj: data.documentType === 'CNPJ' ? data.documentNumber : null,
            responsavel: data.responsiblePerson,
            inscricao_estadual: data.stateRegistration,
            endereco: data.address,
            cidade: data.city,
            estado: data.state,
            cep: data.zipCode,
            plano: "Essencial",
            // ... outros campos que puder salvar
          }])
          .select('id')
          .maybeSingle();
        return resp.data; // retorna { id }
      } else {
        // Atualização incremental do perfil
        const updateObj: any = {};
        // Mapeamento flexível (só atualiza os campos relevantes do step)
        if ('businessName' in data) updateObj.nome_oficina = data.businessName;
        if ('tradingName' in data) updateObj.trading_name = data.tradingName;
        if ('documentType' in data && data.documentType === 'CNPJ') updateObj.cnpj = data.documentNumber;
        if ('stateRegistration' in data) updateObj.inscricao_estadual = data.stateRegistration;
        if ('responsiblePerson' in data) updateObj.responsavel = data.responsiblePerson;
        if ('phone' in data) updateObj.telefone = data.phone;
        if ('email' in data) updateObj.email = data.email;
        if ('address' in data) updateObj.endereco = data.address;
        if ('city' in data) updateObj.cidade = data.city;
        if ('state' in data) updateObj.estado = data.state;
        if ('zipCode' in data) updateObj.cep = data.zipCode;
        if ('addressComplement' in data) updateObj.complemento = data.addressComplement;

        // Upload de logo (se for arquivo)
        if ('logo' in data && data.logo instanceof File) {
          const fileName = `${profileId}/logo.${data.logo.name.split('.').pop()}`;
          try {
            // TODO: verificar bucket
            await supabase.storage.from('logos').upload(fileName, data.logo, { upsert: true, contentType: data.logo.type });
            const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
            updateObj.logo_url = publicUrl;
          } catch (e) {
            console.error('Erro ao salvar logo:', e);
          }
        }

        await supabase
          .from('profiles')
          .update(updateObj)
          .eq('id', profileId);
      }
    } catch (error) {
      // Apenas log, sem bloquear fluxo
      console.error('Erro ao salvar perfil parcial:', error);
    }
  };

  // SUBMISSÃO FINAL
  const handleSubmit = async (
    data: WorkshopRegistrationFormValues, 
    selectedPlan: string,
    profileId?: string | null
  ) => {
    setIsLoading(true);
    try {
      // 1. Criação do usuário no Auth
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
      if (!authData.user) throw new Error("Falha ao criar usuário");

      // 2. Atualiza o perfil parcial com o id Auth (caso profile tenha sido criado sem id igual ao userId)
      if (profileId) {
        await supabase
          .from('profiles')
          .update({ id: authData.user.id })
          .eq('id', profileId);
      }

      // 3. Atualiza perfil com todos os dados finais
      const logoUrl = null; // Logo já salvo antes, caso exista. Pode ser também atualizado aqui se necessário.

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      await supabase
        .from('profiles')
        .update({
          email: data.email,
          responsavel: data.responsiblePerson,
          telefone: data.phone,
          plano: selectedPlan,
          trial_ends_at: trialEndDate.toISOString(),
          is_active: true,
          // outros campos finais
        })
        .eq('id', authData.user.id);

      // 4. Onboarding/Status/Assinatura (resta igual)
      await supabase
        .from('onboarding_status')
        .insert([{ user_id: authData.user.id, profile_completed: true }]);
      await supabase.rpc('create_subscription', {
        user_id: authData.user.id,
        plan_type: selectedPlan.toLowerCase(),
        start_date: new Date().toISOString(),
        end_date: trialEndDate.toISOString()
      });

      // Mensagem sucesso e login automático
      toast({
        title: "Cadastro realizado com sucesso!",
        description:
          "Oficina criada no sistema! Aguarde redirecionamento…",
      });

      setTimeout(async () => {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          navigate('/login');
        } else {
          navigate('/dashboard');
        }
      }, 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao processar o cadastro."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSubmit, createOrUpdatePartialProfile };
}
