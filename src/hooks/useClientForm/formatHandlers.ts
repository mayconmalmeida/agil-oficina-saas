
import React, { useEffect } from 'react';
import { formatCPF, formatCEP, formatPhoneNumber } from '@/utils/formatUtils';
import { formatLicensePlate } from '@/utils/formatUtils';

export const useFormatHandlers = (form: any) => {
  const handleDocumentoFormat = () => {
    const documento = form.watch('documento');
    
    useEffect(() => {
      if (documento) {
        const formatted = formatCPF(documento);
        if (formatted !== documento) {
          form.setValue('documento', formatted);
        }
      }
    }, [documento]);
  };

  const handleCepFormat = () => {
    const cep = form.watch('cep');
    
    useEffect(() => {
      if (cep) {
        const formatted = formatCEP(cep);
        if (formatted !== cep) {
          form.setValue('cep', formatted);
        }
      }
    }, [cep]);
  };

  const handleTelefoneFormat = () => {
    const telefone = form.watch('telefone');
    
    useEffect(() => {
      if (telefone) {
        const formatted = formatPhoneNumber(telefone);
        if (formatted !== telefone) {
          form.setValue('telefone', formatted);
        }
      }
    }, [telefone]);
  };

  const handlePlacaFormat = () => {
    const placa = form.watch('veiculo.placa');
    
    useEffect(() => {
      if (placa) {
        const formatted = formatLicensePlate(placa);
        if (formatted !== placa) {
          form.setValue('veiculo.placa', formatted);
        }
      }
    }, [placa]);
  };

  return {
    handleDocumentoFormat,
    handleCepFormat,
    handleTelefoneFormat,
    handlePlacaFormat
  };
};
