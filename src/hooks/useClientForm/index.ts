
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientFormSchema, ClientFormValues } from './validation';
import { useAddressLookup } from './addressLookup';
import { useFormatHandlers } from './formatHandlers';
import { useClientData } from './clientData';
import { debounce } from '@/utils/debounce';

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
  const isFormattingRef = useRef(false);
  
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
  
  // Debounced formatting functions
  const debouncedDocumentoFormat = useCallback(
    debounce((doc: string) => {
      if (!isFormattingRef.current) {
        isFormattingRef.current = true;
        handleDocumentoFormat(doc);
        setTimeout(() => {
          isFormattingRef.current = false;
        }, 100);
      }
    }, 300),
    [handleDocumentoFormat]
  );

  const debouncedCepFormat = useCallback(
    debounce((cepValue: string) => {
      if (!isFormattingRef.current) {
        isFormattingRef.current = true;
        handleCepFormat(cepValue);
        setTimeout(() => {
          isFormattingRef.current = false;
        }, 100);
      }
    }, 300),
    [handleCepFormat]
  );

  const debouncedPlacaFormat = useCallback(
    debounce((placaValue: string) => {
      if (!isFormattingRef.current) {
        isFormattingRef.current = true;
        handlePlacaFormat(placaValue);
        setTimeout(() => {
          isFormattingRef.current = false;
        }, 100);
      }
    }, 300),
    [handlePlacaFormat]
  );

  const debouncedAddressLookup = useCallback(
    debounce(() => {
      fetchAddressData();
    }, 500),
    [fetchAddressData]
  );
  
  // Fetch client data if in edit mode (only once)
  useEffect(() => {
    if (isEditing && clientId && !hasLoadedData.current) {
      hasLoadedData.current = true;
      loadClientData();
    }
  }, [isEditing, clientId, loadClientData]);
  
  // Auto-lookup address when CEP is fully entered
  useEffect(() => {
    if (cep && cep.length === 9 && !isFormattingRef.current) {
      debouncedAddressLookup();
    }
  }, [cep, debouncedAddressLookup]);
  
  // Format document (CPF)
  useEffect(() => {
    if (documento && !isFormattingRef.current) {
      debouncedDocumentoFormat(documento);
    }
  }, [documento, debouncedDocumentoFormat]);
  
  // Format CEP
  useEffect(() => {
    if (cep && !isFormattingRef.current) {
      debouncedCepFormat(cep);
    }
  }, [cep, debouncedCepFormat]);
  
  // Format license plate - removed auto search
  useEffect(() => {
    if (placa && !isFormattingRef.current) {
      debouncedPlacaFormat(placa);
    }
  }, [placa, debouncedPlacaFormat]);
  
  const handleNextTab = useCallback(() => {
    setActiveTab('veiculo');
  }, []);
  
  const handlePrevTab = useCallback(() => {
    setActiveTab('cliente');
  }, []);
  
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
