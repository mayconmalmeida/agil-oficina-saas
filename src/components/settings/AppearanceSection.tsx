
import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Moon, Sun, Save } from 'lucide-react';

interface AppearanceSectionProps {
  themeSetting: string;
  onToggleTheme: () => void;
}

const AppearanceSection: React.FC<AppearanceSectionProps> = ({ 
  themeSetting, 
  onToggleTheme 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(themeSetting === 'dark');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsDarkMode(themeSetting === 'dark');
    applyTheme(themeSetting);
  }, [themeSetting]);

  const applyTheme = (theme: string) => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      htmlElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
      htmlElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  };

  const handleToggle = async () => {
    setIsSaving(true);
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    const newTheme = newMode ? 'dark' : 'light';
    
    // Aplicar tema imediatamente
    applyTheme(newTheme);
    
    try {
      // Salvar no banco de dados
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', user.id);

        if (error) {
          console.error('Erro ao salvar tema:', error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível salvar a preferência de tema."
          });
        } else {
          toast({
            title: "Tema alterado",
            description: `Modo ${newMode ? 'escuro' : 'claro'} ativado com sucesso.`
          });
        }
      }
      
      // Chamar a função do contexto para atualizar o estado global
      onToggleTheme();
      
    } catch (error) {
      console.error('Erro ao alterar tema:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar o tema."
      });
      // Reverter se houver erro
      setIsDarkMode(!newMode);
      applyTheme(!newMode ? 'dark' : 'light');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Aparência</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Personalize a aparência da plataforma</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isDarkMode ? (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Modo {isDarkMode ? 'Escuro' : 'Claro'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isDarkMode 
                  ? 'Interface escura para reduzir o cansaço visual'
                  : 'Interface clara padrão do sistema'
                }
              </div>
            </div>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={handleToggle}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Preview</h3>
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Exemplo de Card</h4>
            <Button size="sm" variant="outline">
              Ação
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Este é um exemplo de como o conteúdo aparecerá com o tema selecionado.
          </p>
        </div>
      </div>

      {isSaving && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Salvando configurações...
        </div>
      )}
    </div>
  );
};

export default AppearanceSection;
