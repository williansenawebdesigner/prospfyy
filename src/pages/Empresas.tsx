import { useState, useEffect } from 'react';
import { Search, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BusinessTable } from '../components/BusinessTable';
import type { Business, UserSettings } from '../types';

export function Empresas() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Configurações não existem ainda, não mostrar erro
          return;
        }
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      setSettings(data as UserSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const searchBusinesses = async () => {
    if (!settings?.google_api_key) {
      setErrorMessage('Configure sua chave da API do Google Places nas configurações para começar a buscar empresas.');
      setShowErrorPopup(true);
      return;
    }

    if (!searchQuery.trim()) {
      setErrorMessage('Por favor, insira um termo para busca.');
      setShowErrorPopup(true);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${settings.default_location.lat},${settings.default_location.lng}&radius=${settings.search_radius_km * 1000}&key=${settings.google_api_key}`
      );

      if (!placesResponse.ok) {
        throw new Error('Erro ao conectar com a API do Google Places');
      }

      const placesData = await placesResponse.json();
      
      if (placesData.status === 'ZERO_RESULTS') {
        // Salvar pesquisa com 0 resultados
        await supabase.from('search_history').insert({
          user_id: user.id,
          query: searchQuery,
          results_count: 0,
          created_at: new Date().toISOString()
        });
        setBusinesses([]);
        return;
      }
      
      if (placesData.status !== 'OK') {
        if (placesData.status === 'REQUEST_DENIED') {
          throw new Error('Chave da API inválida ou sem permissões necessárias');
        }
        throw new Error(`Erro na API do Google Places: ${placesData.status}`);
      }

      const detailedPlaces = await Promise.allSettled(
        placesData.results.map(async (place: any) => {
          try {
            const detailsResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,formatted_phone_number,website,user_ratings_total,geometry&key=${settings.google_api_key}`
            );

            if (!detailsResponse.ok) return null;

            const detailsData = await detailsResponse.json();
            
            if (detailsData.status !== 'OK') return null;

            const details = detailsData.result;
            return {
              id: place.place_id,
              place_id: place.place_id,
              name: details.name,
              rating: details.rating || 0,
              reviewCount: details.user_ratings_total || 0,
              address: details.formatted_address,
              phone: details.formatted_phone_number || null,
              website: details.website || null,
              location: {
                lat: details.geometry.location.lat,
                lng: details.geometry.location.lng
              }
            };
          } catch {
            return null;
          }
        })
      );

      const validPlaces = detailedPlaces
        .filter((result): result is PromiseFulfilledResult<Business | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value as Business);
      
      if (validPlaces.length === 0) {
        // Salvar pesquisa com 0 resultados válidos
        await supabase.from('search_history').insert({
          user_id: user.id,
          query: searchQuery,
          results_count: 0,
          created_at: new Date().toISOString()
        });
        setBusinesses([]);
        return;
      }
      
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('business_id');

      const existingLeadIds = new Set(existingLeads?.map(lead => lead.business_id) || []);
      
      // Salvar pesquisa com resultados
      await supabase.from('search_history').insert({
        user_id: user.id,
        query: searchQuery,
        results_count: validPlaces.length,
        created_at: new Date().toISOString()
      });
      
      setBusinesses(validPlaces.map(business => ({
        ...business,
        inLeads: existingLeadIds.has(business.id)
      })));
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erro ao buscar empresas. Por favor, verifique sua conexão e tente novamente.');
      }
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Avaliação', 'Total de Avaliações', 'Endereço', 'Telefone', 'Website'];
    const rows = businesses.map(business => [
      business.name,
      business.rating,
      business.reviewCount,
      business.address,
      business.phone || '',
      business.website || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `empresas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-8">
      {/* Barra de pesquisa */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchBusinesses()}
                placeholder="Buscar empresas..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={searchBusinesses}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="sr-only">Buscando...</span>
                </>
              ) : (
                'Buscar'
              )}
            </button>
          </div>

          {!settings?.google_api_key && (
            <div className="mt-4 flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-500">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <p>
                Configure sua chave da API do Google Places nas{' '}
                <a
                  href="/configuracoes"
                  className="font-medium underline hover:text-yellow-700 dark:hover:text-yellow-400"
                >
                  configurações
                </a>{' '}
                para começar a buscar empresas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Popup de erro */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Erro
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {errorMessage}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowErrorPopup(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/20"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de resultados */}
      {businesses.length > 0 && (
        <BusinessTable
          businesses={businesses}
          onExportCSV={handleExportCSV}
        />
      )}

      {/* Estado vazio */}
      {!isLoading && businesses.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma empresa encontrada
          </h3>
          <p>
            Use a barra de pesquisa acima para buscar empresas na sua região.
          </p>
        </div>
      )}
    </div>
  );
} 