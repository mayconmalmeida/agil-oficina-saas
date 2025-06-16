
import React from 'react';
import { Input } from './input';
import { formatCNPJ } from '@/utils/formatters';

interface CNPJInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CNPJInput: React.FC<CNPJInputProps> = ({ value, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    onChange(formatted);
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      placeholder="00.000.000/0000-00"
      maxLength={18}
    />
  );
};
