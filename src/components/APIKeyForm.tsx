import React from 'react';
import { Key } from 'lucide-react';
import type { APIConfig } from '../types';

interface APIKeyFormProps {
  apiConfig: APIConfig;
  onSave: (config: APIConfig) => void;
}

export function APIKeyForm({ apiConfig, onSave }: APIKeyFormProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [key, setKey] = React.useState(apiConfig.key || localStorage.getItem('googleMapsAPIKey') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('googleMapsAPIKey', key);
    onSave({ key });
    setIsEditing(false);
  };

  if (!isEditing && apiConfig.key) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-green-500" />
          <span className="text-sm text-gray-600">API do Google Maps configurada</span>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Alterar chave
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Configurar API do Google Maps</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            Chave da API
          </label>
          <input
            type="password"
            id="apiKey"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Insira sua chave da API do Google Maps"
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          {apiConfig.key && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </form>
  );
}
