
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
    
    // Remove classes anteriores
    htmlElement.classList.remove('dark', 'light');
    bodyElement.classList.remove('dark', 'light');
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      htmlElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
      
      // Aplicar ao body para garantir que tudo fique escuro
      bodyElement.style.backgroundColor = 'rgb(3 7 18)'; // bg-gray-950
      bodyElement.style.color = 'rgb(248 250 252)'; // text-gray-50
    } else {
      htmlElement.classList.add('light');
      bodyElement.classList.add('light');
      htmlElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
      
      // Aplicar ao body para garantir que tudo fique claro
      bodyElement.style.backgroundColor = 'rgb(255 255 255)'; // bg-white
      bodyElement.style.color = 'rgb(15 23 42)'; // text-gray-900
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
        <h2 className="text-lg font-medium text-gray-900">Aparência</h2>
        <p className="text-sm text-gray-500">Personalize a aparência da plataforma</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isDarkMode ? (
              <Moon className="h-5 w-5 text-gray-600" />
            ) : (
              <Sun className="h-5 w-5 text-gray-600" />
            )}
            <div>
              <div className="font-medium text-gray-900">
                Modo {isDarkMode ? 'Escuro' : 'Claro'}
              </div>
              <div className="text-sm text-gray-500">
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

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Preview</h3>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Exemplo de Card</h4>
            <Button size="sm" variant="outline">
              Ação
            </Button>
          </div>
          <p className="text-gray-600 text-sm">
            Este é um exemplo de como o conteúdo aparecerá com o tema selecionado.
          </p>
        </div>
      </div>

      {isSaving && (
        <div className="text-center text-sm text-gray-500">
          Salvando configurações...
        </div>
      )}
    </div>
  );
};

export default AppearanceSection;
