import React from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(searchQuery);
    setSearchQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">
            Pesquisar Empresas
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              id="searchQuery"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: Odontologia em Maringá"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar Empresas
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
