
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from './profileSchema';

interface ProfileFormFieldProps {
  form: UseFormReturn<ProfileFormValues>;
  name: keyof ProfileFormValues;
  label: string;
  placeholder: string;
  disabled?: boolean;
  isSuccess?: boolean;
  formatValue?: (value: string) => string;
}

const ProfileFormField: React.FC<ProfileFormFieldProps> = ({
  form,
  name,
  label,
  placeholder,
  disabled = false,
  isSuccess = false,
  formatValue,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              placeholder={placeholder}
              onChange={(e) => {
                const value = e.target.value;
                const formatted = formatValue ? formatValue(value) : value;
                field.onChange(formatted);
              }}
              value={typeof field.value === 'boolean' ? (field.value ? 'true' : 'false') : (field.value || '')}
              disabled={disabled || isSuccess}
              className={isSuccess ? "bg-green-50 border-green-200" : ""}
              name={String(field.name)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProfileFormField;
