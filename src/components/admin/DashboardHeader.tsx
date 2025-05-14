
import React from 'react';
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  title: string;
  onLogout: () => void;
};

const DashboardHeader = ({ title, onLogout }: DashboardHeaderProps) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <Button onClick={onLogout} variant="outline">Sair</Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
