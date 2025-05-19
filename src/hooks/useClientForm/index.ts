
import { useState, useEffect } from 'react';
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
  const documento = form.watch('documento');
  const cep = form.watch('cep');
  const placa = form.watch('veiculo.placa');
  
  // Initialize custom hooks
  const { fetchAddressData } = useAddressLookup(form, cep);
  const { handleDocumentoFormat, handleCepFormat, handlePlacaFormat } = useFormatHandlers(form);
  const { isLoading, saveSuccess, setSaveSuccess, loadClientData, saveClientData } = useClientData(
    form,
    clientId,
    isEditing
  );
  
  // Fetch client data if in edit mode
  useEffect(() => {
    if (isEditing && clientId) {
      loadClientData();
    }
  }, [isEditing, clientId]);
  
  // Auto-lookup address when CEP is fully entered
  useEffect(() => {
    if (cep && cep.length === 9) {
      fetchAddressData();
    }
  }, [cep]);
  
  // Format document (CPF)
  useEffect(() => {
    handleDocumentoFormat(documento);
  }, [documento]);
  
  // Format CEP
  useEffect(() => {
    handleCepFormat(cep);
  }, [cep]);
  
  // Format license plate
  useEffect(() => {
    handlePlacaFormat(placa);
  }, [placa]);
  
  const handleNextTab = () => {
    setActiveTab('veiculo');
  };
  
  const handlePrevTab = () => {
    setActiveTab('cliente');
  };
  
  const onSubmit = async (values: ClientFormValues) => {
    const success = await saveClientData(values);
    if (success) {
      onSave();
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
