
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';
import ControlStockToggle from './inventory/ControlStockToggle';
import StockFields from './inventory/StockFields';

interface InventorySectionProps {
  form: UseFormReturn<ProductFormValues>;
  controlStock: boolean;
}

const InventorySection: React.FC<InventorySectionProps> = ({ form, controlStock }) => {
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Controle de Estoque</h3>
        <ControlStockToggle form={form} />
      </div>
      
      {controlStock && <StockFields form={form} />}
    </div>
  );
};

export default InventorySection;
