
import React, { useState } from 'react';
import { Input } from './input';
import { formatCEP, fetchAddressByCEP } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CEPInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onAddressFound?: (address: {
    street: string;
    city: string;
    state: string;
    neighborhood: string;
  }) => void;
}

export const CEPInput: React.FC<CEPInputProps> = ({ 
  value, 
  onChange, 
  onAddressFound,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    onChange(formatted);
  };

  const handleBlur = async () => {
    const cleanCEP = value.replace(/\D/g, '');
    
    if (cleanCEP.length === 8) {
      setIsLoading(true);
      try {
        const address = await fetchAddressByCEP(cleanCEP);
        onAddressFound?.(address);
        
        toast({
          title: "Endereço encontrado!",
          description: "Os campos foram preenchidos automaticamente.",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="00000-000"
        maxLength={9}
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
      )}
    </div>
  );
};
