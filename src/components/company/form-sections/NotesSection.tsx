
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { CompanyFormValues } from '../companyProfileSchema';

interface NotesSectionProps {
  form: UseFormReturn<CompanyFormValues>;
}

const NotesSection: React.FC<NotesSectionProps> = ({ form }) => {
  return (
    <div className="border-t pt-4 mt-4">
      <FormField
        control={form.control}
        name="observacoes_orcamento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações para Orçamentos</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Texto que aparecerá no rodapé dos orçamentos" 
                rows={3} 
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default NotesSection;
