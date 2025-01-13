import type { Business } from '../types';

interface PlaceDetails {
  website?: string;
  formatted_phone_number?: string;
}

export async function searchBusinesses(query: string, apiKey: string): Promise<Business[]> {
  try {
    if (!query) {
      throw new Error('Por favor, forneça um termo de busca');
    }

    if (!apiKey) {
      throw new Error('Chave da API do Google Maps não configurada');
    }

    // Se for uma URL do Google Maps, extrair a query
    let searchQuery = query;
    if (query.includes('google.com/maps')) {
      const mapsUrl = new URL(query);
      
      // Tentar extrair de URLs do formato /search/
      if (mapsUrl.pathname.includes('/search/')) {
        const searchPath = decodeURIComponent(mapsUrl.pathname);
        const match = searchPath.match(/\/search\/([^\/]+)/);
        if (match && match[1]) {
          searchQuery = match[1].replace(/\+/g, ' ');
        }
      }
      
      // Se não encontrou no path, tentar no parâmetro 'q'
      if (searchQuery === query && mapsUrl.searchParams.has('q')) {
        searchQuery = mapsUrl.searchParams.get('q') || '';
      }
      
      // Se ainda não encontrou, tentar extrair do pathname completo
      if (searchQuery === query) {
        const pathParts = mapsUrl.pathname.split('/');
        if (pathParts.length > 2) {
          searchQuery = decodeURIComponent(pathParts[pathParts.length - 1])
            .replace(/\+/g, ' ')
            .replace(/@.*$/, '');
        }
      }
    }

    // Limpar e preparar a query
    const cleanQuery = decodeURIComponent(searchQuery)
      .replace(/\+/g, ' ')
      .trim();

    // Fazer a requisição através do proxy
    const searchResponse = await fetch(
      `/api/places/search?query=${encodeURIComponent(cleanQuery)}&key=${apiKey}`
    );
    
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json().catch(() => ({ error_message: 'Erro desconhecido' }));
      throw new Error(`Erro na API do Google Places: ${errorData.error_message}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.results?.length) {
      throw new Error('Nenhum resultado encontrado para esta busca');
    }

    // Processar os resultados
    const businesses = await Promise.all(
      searchData.results.map(async (place: any) => {
        let details: PlaceDetails = {};
        
        try {
          const detailsResponse = await fetch(
            `/api/places/details?place_id=${place.place_id}&key=${apiKey}&fields=website,formatted_phone_number`
          );
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            details = detailsData.result || {};
          }
        } catch (error) {
          console.warn(`Não foi possível obter detalhes para ${place.name}`);
        }

        return {
          name: place.name || 'Nome não disponível',
          rating: Number(place.rating) || 0,
          reviewCount: Number(place.user_ratings_total) || 0,
          address: place.formatted_address || 'Endereço não disponível',
          website: details?.website || '',
          phone: details?.formatted_phone_number || '',
        };
      })
    );

    return businesses;
  } catch (error) {
    // Garantir que sempre retornamos uma mensagem de erro significativa
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Ocorreu um erro ao processar os dados do Google Maps';
    
    console.error('Erro ao processar dados do Google Maps:', errorMessage);
    throw new Error(errorMessage);
  }
}
