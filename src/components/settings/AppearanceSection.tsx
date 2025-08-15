
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
    
    // Apply dark mode globally to the entire SaaS
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (themeSetting === 'dark') {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      // Apply dark mode to all possible elements
      htmlElement.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
      htmlElement.style.colorScheme = 'light';
    }
  }, [themeSetting]);

  const handleToggle = () => {
    onToggleTheme();
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Apply dark mode immediately to entire SaaS
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (newMode) {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      htmlElement.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
      htmlElement.style.colorScheme = 'light';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Tema</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Personalize a aparência da plataforma</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex flex-col gap-2">
          <span className="font-medium">Modo Escuro</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Habilite o modo escuro para reduzir o cansaço visual à noite</span>
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
