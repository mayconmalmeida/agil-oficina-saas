
import React from 'react';

interface BudgetPageHeaderProps {
  title: string;
  subtitle: string;
}

const BudgetPageHeader: React.FC<BudgetPageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-oficina-dark">
        {title}
      </h1>
      <p className="mt-2 text-oficina-gray">
        {subtitle}
      </p>
    </div>
  );
};

export default BudgetPageHeader;
