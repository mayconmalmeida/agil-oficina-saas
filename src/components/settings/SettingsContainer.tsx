
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SettingsTabs from './SettingsTabs';

interface SettingsContainerProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  children: React.ReactNode;
}

const SettingsContainer: React.FC<SettingsContainerProps> = ({ 
  activeTab, 
  setActiveTab,
  children 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        </div>
        
        <Card className="dark:bg-gray-800">
          <CardContent className="p-6">
            <SettingsTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
            >
              {children}
            </SettingsTabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsContainer;
