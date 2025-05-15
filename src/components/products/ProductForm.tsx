
import React from 'react';
import { Form } from '@/components/ui/form';
import { useProductForm } from '@/hooks/useProductForm';
import BasicInfoSection from '@/components/products/form-sections/BasicInfoSection';
import InventorySection from '@/components/products/form-sections/InventorySection';
import AdditionalInfoSection from '@/components/products/form-sections/AdditionalInfoSection';
import ProductFormSubmitButton from '@/components/products/ProductFormSubmitButton';

interface ProductFormProps {
  productId?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ productId }) => {
  const { form, isLoading, productType, controlStock, handleSubmit, isEditing } = useProductForm(productId);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <BasicInfoSection form={form} />
        
        {productType === 'produto' && (
          <InventorySection form={form} controlStock={controlStock} />
        )}
        
        <AdditionalInfoSection form={form} />
        
        <ProductFormSubmitButton isLoading={isLoading} isEditing={isEditing} />
      </form>
    </Form>
  );
};

export default ProductForm;
