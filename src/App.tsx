import { useState } from 'react';
import { BusinessTable } from './components/BusinessTable';
import { SearchForm } from './components/SearchForm';
import { APIKeyForm } from './components/APIKeyForm';
import { exportToCSV } from './utils/csv';
import { searchBusinesses } from './utils/maps';
import type { Business, BusinessFormData, APIConfig } from './types';
import { MapPin } from 'lucide-react';

function App() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig>({ key: '' });

  const handleSearch = async (url: string) => {
    if (!apiConfig.key) {
      alert('Por favor, configure a chave da API do Google Maps primeiro.');
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchBusinesses(url, apiConfig.key);
      setBusinesses(prev => [...prev, ...results]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Nenhum resultado encontrado para esta busca') {
          alert('Nenhum resultado encontrado. Tente ajustar sua pesquisa.');
        } else {
          alert('Erro ao processar a busca. Verifique a URL e a chave da API.');
        }
      } else {
        alert('Erro desconhecido ao processar a busca.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (businesses.length === 0) return;
    exportToCSV(businesses, 'empresas-google-maps.csv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-8 sm:px-0">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <MapPin className="h-14 w-14 text-blue-600 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Gerenciador de Listagens do Google Maps
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Importe dados do Google Maps de forma simples e eficiente
            </p>
          </div>

          <div className="space-y-10">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <APIKeyForm apiConfig={apiConfig} onSave={setApiConfig} />
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                Importar do Google Maps
              </h2>
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
            
            {businesses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <BusinessTable
                  businesses={businesses}
                  onExportCSV={handleExportCSV}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
