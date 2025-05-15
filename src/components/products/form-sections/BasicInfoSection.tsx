
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';
import ProductNameField from './basic/ProductNameField';
import ProductCodeField from './basic/ProductCodeField';
import ProductTypeField from './basic/ProductTypeField';
import PricingFields from './basic/PricingFields';

interface BasicInfoSectionProps {
  form: UseFormReturn<ProductFormValues>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProductNameField form={form} />
        <ProductCodeField form={form} />
      </div>
      
      <ProductTypeField form={form} />
      
      <PricingFields form={form} />
    </>
  );
};

export default BasicInfoSection;
