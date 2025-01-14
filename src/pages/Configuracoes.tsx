import { useState, useEffect } from 'react';
import { Save, Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

export function Configuracoes() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Campos de configuração
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Carregar email do usuário
      setEmail(user.email || '');

      // Carregar configurações da API
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', settingsError);
        return;
      }

      if (settings) {
        setApiKey(settings.google_api_key || '');
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmail = async () => {
    try {
      if (!user || !email) return;

      const { error } = await supabase.auth.updateUser({ email });

      if (error) throw error;

      setSaveMessage({
        type: 'success',
        text: 'Email atualizado com sucesso! Verifique sua caixa de entrada para confirmar.'
      });
    } catch (error: any) {
      console.error('Erro ao atualizar email:', error);
      setSaveMessage({
        type: 'error',
        text: error.message || 'Erro ao atualizar email. Tente novamente.'
      });
    }
  };

  const updatePassword = async () => {
    try {
      if (!user || !newPassword) return;

      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      setNewPassword('');
      setSaveMessage({
        type: 'success',
        text: 'Senha atualizada com sucesso!'
      });
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      setSaveMessage({
        type: 'error',
        text: error.message || 'Erro ao atualizar senha. Tente novamente.'
      });
    }
  };

  const updateApiKey = async () => {
    try {
      if (!user) return;

      // Primeiro verifica se já existe um registro
      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao verificar configurações existentes:', fetchError);
        throw fetchError;
      }

      let error;

      if (!existingSettings) {
        // Se não existe, cria um novo registro
        console.log('Criando novas configurações...');
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            google_api_key: apiKey,
            search_radius_km: 5,
            default_location: {
              lat: -23.5505,
              lng: -46.6333
            }
          });
        error = insertError;
      } else {
        // Se existe, atualiza o registro
        console.log('Atualizando configurações existentes...');
        const { error: updateError } = await supabase
          .from('user_settings')
          .update({
            google_api_key: apiKey
          })
          .eq('user_id', user.id);
        error = updateError;
      }

      if (error) {
        console.error('Erro na operação do Supabase:', error);
        throw error;
      }

      setSaveMessage({
        type: 'success',
        text: 'Chave da API salva com sucesso!'
      });
    } catch (error: any) {
      console.error('Erro ao salvar chave da API:', error);
      setSaveMessage({
        type: 'error',
        text: error.message || 'Erro ao salvar chave da API. Tente novamente.'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      setSaveMessage({
        type: 'error',
        text: 'Usuário não autenticado. Por favor, faça login novamente.'
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Atualizar email se foi modificado
      if (email !== user.email) {
        await updateEmail();
      }

      // Atualizar senha se foi preenchida
      if (newPassword) {
        await updatePassword();
      }

      // Atualizar chave da API
      await updateApiKey();

      // Limpar a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setSaveMessage({
        type: 'error',
        text: 'Erro ao salvar configurações. Por favor, tente novamente.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configurações
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gerencie suas configurações de conta e API
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  placeholder="seu@email.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  placeholder="Digite a nova senha"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Deixe em branco para manter a senha atual
              </p>
            </div>

            {/* Google Places API */}
            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Chave da API do Google Places
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  placeholder="Insira sua chave da API"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Necessária para buscar informações de empresas no Google Maps.
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/get-api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
                >
                  Saiba mais
                </a>
              </p>
            </div>

            {/* Mensagem de feedback */}
            {saveMessage && (
              <div 
                className={`p-4 rounded-xl ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {saveMessage.text}
              </div>
            )}

            {/* Botão de salvar */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`
                  w-full inline-flex items-center justify-center px-4 py-2.5 
                  ${isSaving 
                    ? 'bg-gray-400 dark:bg-gray-600' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }
                  text-white text-sm font-medium rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-all duration-200 shadow-lg shadow-blue-500/20
                `}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Salvar configurações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
