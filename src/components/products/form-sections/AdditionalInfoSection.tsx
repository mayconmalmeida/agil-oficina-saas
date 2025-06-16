
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';
import DescriptionField from './description/DescriptionField';
import SupplierSelectField from './supplier/SupplierSelectField';
import CategoriesSelectField from './categories/CategoriesSelectField';

interface AdditionalInfoSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ form }) => {
  return (
    <>
      <DescriptionField form={form} />
      <SupplierSelectField form={form} />
      <CategoriesSelectField form={form} />
    </>
  );
};

export default AdditionalInfoSection;
