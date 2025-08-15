
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
    
    // Apply dark mode globally to document
    if (themeSetting === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      // Apply to all existing elements
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.classList.contains('bg-white')) {
          el.classList.add('dark:bg-gray-900');
        }
        if (el.classList.contains('text-black')) {
          el.classList.add('dark:text-white');
        }
      });
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [themeSetting]);

  const handleToggle = () => {
    onToggleTheme();
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Apply dark mode globally and immediately
    if (newMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      // Force update all components
      window.dispatchEvent(new Event('themeChange'));
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      // Force update all components
      window.dispatchEvent(new Event('themeChange'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium dark:text-white">Tema</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Personalize a aparência da plataforma</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex flex-col gap-2">
          <span className="font-medium dark:text-white">Modo Escuro</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Habilite o modo escuro para reduzir o cansaço visual à noite e aplicar em todo o SaaS
          </span>
        </div>
        <Switch
          checked={isDarkMode}
          onCheckedChange={handleToggle}
        />
      </div>
      
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Aplicação Global</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          O modo escuro será aplicado em todo o sistema, incluindo todas as páginas, 
          componentes e módulos do SaaS para uma experiência consistente.
        </p>
      </div>
    </div>
  );
};

export default AppearanceSection;
