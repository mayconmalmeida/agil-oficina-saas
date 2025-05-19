
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ClientContactFieldsProps {
  form: UseFormReturn<any>;
  saveSuccess: boolean;
}

const ClientContactFields: React.FC<ClientContactFieldsProps> = ({ form, saveSuccess }) => {
  return (
    <></>
  );
};

export default ClientContactFields;
