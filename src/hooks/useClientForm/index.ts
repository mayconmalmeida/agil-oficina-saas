
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientFormSchema, ClientFormValues } from './validation';
import { useAddressLookup } from './addressLookup';
import { useFormatHandlers } from './formatHandlers';
import { useClientData } from './clientData';

interface UseClientFormProps {
  onSave: () => void;
  initialData?: Partial<ClientFormValues>;
  isEditing?: boolean;
  clientId?: string;
}

export const useClientForm = ({ 
  onSave, 
  initialData = {},
  isEditing = false,
  clientId
}: UseClientFormProps) => {
  const [activeTab, setActiveTab] = useState<string>('cliente');
  const hasLoadedData = useRef(false);
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nome: initialData.nome || '',
      tipo: initialData.tipo || 'pf',
      documento: initialData.documento || '',
      telefone: initialData.telefone || '',
      email: initialData.email || '',
      cep: initialData.cep || '',
      endereco: initialData.endereco || '',
      numero: initialData.numero || '',
      bairro: initialData.bairro || '',
      cidade: initialData.cidade || '',
      estado: initialData.estado || '',
      veiculo: {
        marca: initialData.veiculo?.marca || '',
        modelo: initialData.veiculo?.modelo || '',
        ano: initialData.veiculo?.ano || '',
        placa: initialData.veiculo?.placa || '',
        cor: initialData.veiculo?.cor || '',
        kilometragem: initialData.veiculo?.kilometragem || ''
      }
    },
  });

  // Watch for form field values to apply formatting
  const cep = form.watch('cep');
  
  // Initialize custom hooks
  const { fetchAddressData } = useAddressLookup(form, cep);
  const { handleDocumentoFormat, handleCepFormat, handlePlacaFormat } = useFormatHandlers(form);
  const { isLoading, saveSuccess, setSaveSuccess, loadClientData, saveClientData } = useClientData(
    form,
    clientId,
    isEditing
  );
  
  // Fetch client data if in edit mode (only once)
  useEffect(() => {
    if (isEditing && clientId && !hasLoadedData.current) {
      hasLoadedData.current = true;
      console.log('Carregando dados do cliente para edição');
      loadClientData();
    }
  }, [isEditing, clientId, loadClientData]);
  
  // Auto-lookup address when CEP is fully entered
  useEffect(() => {
    if (cep && cep.length === 9) {
      console.log('CEP completo detectado, buscando endereço:', cep);
      fetchAddressData();
    }
  }, [cep, fetchAddressData]);
  
  const handleNextTab = useCallback(() => {
    setActiveTab('veiculo');
  }, []);
  
  const handlePrevTab = useCallback(() => {
    setActiveTab('cliente');
  }, []);
  
  const onSubmit = async (values: ClientFormValues) => {
    console.log('useClientForm onSubmit chamado com valores:', values);
    
    // Validar formulário antes de salvar
    const isValid = await form.trigger();
    if (!isValid) {
      console.log('Formulário inválido, não salvando');
      return;
    }
    
    console.log('Formulário válido, procedendo com salvamento');
    const success = await saveClientData(values);
    
    if (success) {
      console.log('Cliente salvo com sucesso, chamando onSave');
      // Aguardar um pouco antes de chamar onSave para mostrar o feedback visual
      setTimeout(() => {
        onSave();
      }, 1500);
    }
  };
  
  return {
    form,
    activeTab,
    setActiveTab,
    isLoading,
    saveSuccess,
    setSaveSuccess,
    handleNextTab,
    handlePrevTab,
    onSubmit
  };
};

export type { ClientFormValues } from './validation';
