
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { validateOficinaUniqueness, checkExistingOficina } from '@/utils/oficinasValidation';
import { WorkshopRegistrationFormValues } from './workshopRegistrationSchema';

export function useWorkshopRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Salvamento progressivo de perfil/oficina
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
        // Gerar UUID temporário para criar o perfil "rascunho"
        const tempProfileId = crypto.randomUUID();
        resp = await supabase
          .from('profiles')
          .insert([{
            id: tempProfileId,
            nome_oficina: data.businessName,
            cnpj: data.documentType === 'CNPJ' ? data.documentNumber : null,
            responsavel: data.responsiblePerson,
            endereco: data.address,
            cidade: data.city,
            estado: data.state,
            cep: data.zipCode,
            plano: "Essencial",
            email: data.email,
            telefone: data.phone,
            logo_url: undefined,
            is_active: false,
            role: "oficina"
          }])
          .select('id')
          .maybeSingle();
        // Retorna { id } para armazenar localmente
        return resp.data;
      } else {
        // Atualização incremental do perfil
        const updateObj: any = {};
        if ('businessName' in data) updateObj.nome_oficina = data.businessName;
        if ('tradingName' in data) updateObj.trading_name = data.tradingName;
        if ('documentType' in data && data.documentType === 'CNPJ') updateObj.cnpj = data.documentNumber;
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
      console.log('🚀 Iniciando registro de oficina:', { email: data.email, businessName: data.businessName });

      // 1. VALIDAR UNICIDADE ANTES DE CRIAR USUÁRIO
      const validation = await validateOficinaUniqueness(
        data.email, 
        data.documentType === 'CNPJ' ? data.documentNumber : ''
      );

      if (!validation.valid) {
        toast({
          variant: "destructive",
          title: "Email já cadastrado",
          description: validation.message,
        });
        return;
      }

      // 2. Criação do usuário no Auth
      console.log('✅ Validação passou, criando usuário Auth...');
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
      
      if (authError) {
        console.error('❌ Erro ao criar usuário Auth:', authError);
        throw authError;
      }
      if (!authData.user) throw new Error("Falha ao criar usuário");

      console.log('✅ Usuário Auth criado:', authData.user.id);

      // 3. VERIFICAR SE JÁ EXISTE OFICINA PARA ESTE USUÁRIO
      const existingCheck = await checkExistingOficina(authData.user.id);
      if (existingCheck.exists) {
        console.log('⚠️ Oficina já existe, atualizando...');
        toast({
          title: "Oficina já existe",
          description: "Atualizando dados da oficina existente.",
        });
      }

      // 4. Criar/Atualizar oficina na tabela oficinas
      const oficinaData = {
        user_id: authData.user.id,
        nome_oficina: data.businessName,
        cnpj: data.documentType === 'CNPJ' ? data.documentNumber : null,
        telefone: data.phone,
        email: data.email,
        responsavel: data.responsiblePerson,
        endereco: data.address,
        cidade: data.city,
        estado: data.state,
        cep: data.zipCode,
        plano: selectedPlan,
        is_active: true,
        ativo: true,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias de trial
      };

      console.log('📝 Inserindo/atualizando oficina:', oficinaData);

      const { error: oficinaError } = await supabase
        .from('oficinas')
        .upsert(oficinaData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (oficinaError) {
        console.error('❌ Erro ao criar/atualizar oficina:', oficinaError);
        throw new Error(`Erro ao cadastrar oficina: ${oficinaError.message}`);
      }

      console.log('✅ Oficina criada/atualizada com sucesso');

      // 5. Atualizar perfil com dados finais
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: data.email,
          responsavel: data.responsiblePerson,
          telefone: data.phone,
          nome_oficina: data.businessName,
          cnpj: data.documentType === 'CNPJ' ? data.documentNumber : null,
          plano: selectedPlan,
          trial_ends_at: trialEndDate.toISOString(),
          is_active: true,
          role: 'oficina'
        }, {
          onConflict: 'id'
        });

      // 6. Onboarding
      await supabase
        .from('onboarding_status')
        .upsert([{ 
          user_id: authData.user.id, 
          profile_completed: true 
        }], {
          onConflict: 'user_id'
        });

      console.log('✅ Cadastro concluído com sucesso!');

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Oficina criada no sistema! Aguarde redirecionamento…",
      });

      setTimeout(async () => {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          console.error('❌ Erro no login automático:', signInError);
          navigate('/login');
        } else {
          console.log('✅ Login automático realizado');
          navigate('/dashboard');
        }
      }, 2000);

    } catch (error: any) {
      console.error('💥 Erro no cadastro:', error);
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
