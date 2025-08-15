
import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

interface AppearanceSectionProps {
  themeSetting: string;
  onToggleTheme: () => void;
}

const AppearanceSection: React.FC<AppearanceSectionProps> = ({ 
  themeSetting, 
  onToggleTheme 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(themeSetting === 'dark');

  useEffect(() => {
    setIsDarkMode(themeSetting === 'dark');
    
    // Apply dark mode to document
    if (themeSetting === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeSetting]);

  const handleToggle = () => {
    onToggleTheme();
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Apply dark mode immediately
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Tema</h2>
        <p className="text-sm text-gray-500">Personalize a aparência da plataforma</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex flex-col gap-2">
          <span className="font-medium">Modo Escuro</span>
          <span className="text-sm text-gray-500">Habilite o modo escuro para reduzir o cansaço visual à noite</span>
        </div>
        <Switch
          checked={isDarkMode}
          onCheckedChange={handleToggle}
        />
      </div>
    </div>
  );
};

export default AppearanceSection;
