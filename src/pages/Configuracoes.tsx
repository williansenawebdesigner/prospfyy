import { APIKeyForm } from '../components/APIKeyForm';
import type { APIConfig } from '../types';
import { Sun, Moon, Download, Info } from 'lucide-react';

interface ConfiguracoesProps {
  apiConfig: APIConfig;
  onSave: (config: APIConfig) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Configuracoes({ apiConfig, onSave, darkMode, toggleDarkMode }: ConfiguracoesProps) {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Configurações da API */}
      <div className="dark:bg-gray-800 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <span className="bg-blue-50 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full p-2">
            <Info className="h-5 w-5" />
          </span>
          Configurações da API
        </h2>
        <APIKeyForm apiConfig={apiConfig} onSave={onSave} />
      </div>

      {/* Configurações de Aparência */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <span className="bg-purple-50 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full p-2">
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </span>
          Aparência
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-300">Modo Escuro</p>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Configurações de Exportação */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <span className="bg-green-50 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-full p-2">
            <Download className="h-5 w-5" />
          </span>
          Exportação de Dados
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Configurações relacionadas à exportação de dados
          </p>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-300">Formato padrão</p>
            <select
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2"
              defaultValue="csv"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xlsx">Excel</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
