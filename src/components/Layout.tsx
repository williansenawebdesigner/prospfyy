import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(() => {
    // Verificar preferência salva no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Se não houver preferência salva, usar preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const { user } = useAuth();

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        if (!user) return;

        const { data } = await supabase
          .from('user_settings')
          .select('dark_mode')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setDarkMode(data.dark_mode);
          // Salvar no localStorage também
          localStorage.setItem('theme', data.dark_mode ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
      }
    };

    loadThemePreference();
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    // Salvar no localStorage sempre que o tema mudar
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = async () => {
    try {
      if (!user) return;

      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);

      await supabase
        .from('user_settings')
        .update({ dark_mode: newDarkMode })
        .eq('user_id', user.id);

      // Salvar no localStorage
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao atualizar tema:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 