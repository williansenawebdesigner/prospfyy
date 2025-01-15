import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
}

// Função para obter o tema inicial
const getInitialTheme = (): boolean => {
  // Primeiro verifica no localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  // Se não houver preferência salva, usa preferência do sistema
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Função para sincronizar o tema com o Supabase
const syncThemeWithSupabase = async (user: any, darkMode: boolean) => {
  if (!user) return;

  try {
    const { error } = await supabase
      .from('user_settings')
      .update({ dark_mode: darkMode })
      .eq('user_id', user.id);

    if (error) {
      // Se o erro for que o registro não existe, cria um novo
      if (error.code === 'PGRST116') {
        await supabase
          .from('user_settings')
          .insert([
            {
              user_id: user.id,
              dark_mode: darkMode,
              search_radius_km: 10,
              default_location: { lat: -23.550520, lng: -46.633308 } // São Paulo
            }
          ]);
      } else {
        console.error('Erro ao sincronizar tema com Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar tema:', error);
  }
};

export function Layout({ children }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(getInitialTheme);
  const { user } = useAuth();

  // Efeito para aplicar o tema ao documento
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Efeito para sincronizar com Supabase quando o usuário logar
  useEffect(() => {
    if (user) {
      // Busca as configurações do usuário no Supabase
      const loadUserSettings = async () => {
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('dark_mode')
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            // Se o tema do Supabase for diferente do localStorage, atualiza
            const currentTheme = localStorage.getItem('theme') === 'dark';
            if (currentTheme !== data.dark_mode) {
              setDarkMode(data.dark_mode);
              localStorage.setItem('theme', data.dark_mode ? 'dark' : 'light');
            }
          } else if (error.code === 'PGRST116') {
            // Se não existir configuração, sincroniza o tema atual com o Supabase
            syncThemeWithSupabase(user, darkMode);
          }
        } catch (error) {
          console.error('Erro ao carregar configurações:', error);
        }
      };

      loadUserSettings();
    }
  }, [user]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    
    // Atualiza estado e localStorage imediatamente
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

    // Sincroniza com Supabase em segundo plano
    if (user) {
      syncThemeWithSupabase(user, newDarkMode);
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