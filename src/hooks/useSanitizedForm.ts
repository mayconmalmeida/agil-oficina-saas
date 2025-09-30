
import React, { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import * as formUtils from '@/utils/formUtils';

/**
 * Hook para aplicar sanitização/validação antes do submit de um formulário.
 * Recebe o useForm (react-hook-form) e transforma dados automaticamente.
 */
export function useSanitizedForm<T>(form: UseFormReturn<T>, sanitizeMap: Partial<Record<keyof T, (value: any) => any>> = {}) {
  // Retorna handleSubmit que sanitiza campos selecionados antes do submit real
  const sanitizedHandleSubmit = useCallback(
    (onValid: (values: T) => void | Promise<void>) =>
      form.handleSubmit(values => {
        const sanitizedValues = { ...values };
        // Sanitiza apenas campos listados no sanitizeMap
        for (const key in sanitizeMap) {
          if (Object.prototype.hasOwnProperty.call(sanitizeMap, key) && values[key] !== undefined) {
            sanitizedValues[key] = sanitizeMap[key]?.(values[key]);
          }
        }
        onValid(sanitizedValues as T);
      }),
    [form, sanitizeMap]
  );

  return sanitizedHandleSubmit;
}
