
import React from 'react';
import { useProductForm } from '@/hooks/useProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProductBasicInfo from './form-sections/ProductBasicInfo';
import ProductPricing from './form-sections/ProductPricing';
import ProductStock from './form-sections/ProductStock';
import ProductDescription from './form-sections/ProductDescription';

interface ProductFormProps {
  productId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  productId, 
  onSuccess,
  onCancel 
}) => {
  const {
    form,
    isLoading,
    productType,
    controlStock,
    handleSubmit,
    isEditing,
  } = useProductForm(productId, onSuccess);

  const onSubmit = (values: any) => {
    handleSubmit(values);
  };

  return (
    <div className="space-y-6">
      {onCancel && (
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Atualize as informações do produto' : 'Adicione um novo produto ao estoque'}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ProductBasicInfo form={form} />
              <ProductPricing form={form} />
              <ProductStock form={form} controlStock={controlStock} />
              <ProductDescription form={form} />

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    isEditing ? 'Atualizar Produto' : 'Criar Produto'
                  )}
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
