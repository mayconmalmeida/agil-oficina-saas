
import React from 'react';

type WelcomeHeaderProps = {
  officeName: string | null;
  fullName: string | null;
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ officeName, fullName }) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl font-extrabold text-oficina-dark sm:text-4xl">
        Bem-vindo ao OficinaÁgil
      </h1>
      <p className="mt-3 text-xl text-oficina-gray">
        {officeName || fullName || 'Sua Oficina'}
      </p>
    </div>
  );
};

export default WelcomeHeader;
