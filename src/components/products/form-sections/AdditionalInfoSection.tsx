
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';
import DescriptionField from './description/DescriptionField';
import SupplierField from './supplier/SupplierField';
import CategoriesField from './categories/CategoriesField';

interface AdditionalInfoSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ form }) => {
  return (
    <>
      <DescriptionField form={form} />
      <SupplierField form={form} />
      <CategoriesField form={form} />
    </>
  );
};

export default AdditionalInfoSection;
