import React from 'react';
import { Download, Star } from 'lucide-react';
import type { Business } from '../types';

interface BusinessTableProps {
  businesses: Business[];
  onExportCSV: () => void;
}

export function BusinessTable({ businesses, onExportCSV }: BusinessTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {businesses.map((business, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 min-w-[150px] max-w-[200px]">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
