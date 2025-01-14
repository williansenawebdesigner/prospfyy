import { Download, Star, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Business } from '../types';
import { supabase } from '../lib/supabase';

interface BusinessTableProps {
  businesses: Business[];
  onExportCSV: () => void;
}

export function BusinessTable({ businesses, onExportCSV }: BusinessTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [hasWebsiteFilter, setHasWebsiteFilter] = useState<'all' | 'with' | 'without'>('all');

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter ? business.rating >= ratingFilter : true;
    const matchesWebsite = 
      hasWebsiteFilter === 'all' ? true :
      hasWebsiteFilter === 'with' ? !!business.website :
      !business.website;
    
    return matchesSearch && matchesRating && matchesWebsite;
  });
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            Empresas Listadas
          </h2>
          <button
            onClick={onExportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-5 w-5 mr-2" />
            Exportar CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <div className="relative flex-[2] min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar empresas..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              value={ratingFilter || ''}
              onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as avaliações</option>
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>
                  {rating}+ estrelas
                </option>
              ))}
            </select>

            <select
              value={hasWebsiteFilter}
              onChange={(e) => setHasWebsiteFilter(e.target.value as 'all' | 'with' | 'without')}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os sites</option>
              <option value="with">Com site</option>
              <option value="without">Sem site</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200/50">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Avaliações
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Endereço
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Contato
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {filteredBusinesses.map((business, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 min-w-[150px] max-w-[450px]">
                  <div className="text-sm font-medium text-gray-900">
                    {business.name}
                  </div>
                  {business.website && (
                    <div className="text-sm text-gray-500 mt-1">
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {business.website}
                      </a>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      business.rating >= 4 ? 'bg-green-500' :
                      business.rating >= 3 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex items-center text-sm text-gray-700">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {business.rating} ({business.reviewCount})
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 min-w-[250px]">
                  <div className="text-sm text-gray-700">
                    {business.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                  {business.phone ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {business.phone}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    disabled={business.inLeads}
                    className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase
                          .from('leads')
                          .insert({
                            business_id: business.id,
                            name: business.name,
                            status: 'Prospectar'
                          })
                          .select()
                          .single();

                        if (error) throw error;
                        
                        business.inLeads = true;
                        alert('Empresa adicionada à gestão de leads com sucesso!');
                      } catch (error) {
                        console.error('Erro ao adicionar lead:', error);
                        alert('Erro ao adicionar empresa à gestão de leads');
                      }
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
