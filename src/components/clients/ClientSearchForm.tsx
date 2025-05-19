
import React, { useState, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface ClientSearchFormProps {
  onSearchChange: (value: string) => void;
}

const ClientSearchForm: React.FC<ClientSearchFormProps> = ({ onSearchChange }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <Input 
        type="text"
        placeholder="Buscar cliente por nome, telefone ou veículo..."
        value={searchValue}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  );
};

export default ClientSearchForm;
