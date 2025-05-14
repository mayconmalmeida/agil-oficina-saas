
import React from 'react';
import { Button } from "@/components/ui/button";

type UsersHeaderProps = {
  onBack: () => void;
};

const UsersHeader = ({ onBack }: UsersHeaderProps) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <Button onClick={onBack}>
          Voltar ao Dashboard
        </Button>
      </div>
    </header>
  );
};

export default UsersHeader;
