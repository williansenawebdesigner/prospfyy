import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { BusinessTable } from './components/BusinessTable';
import { SearchForm } from './components/SearchForm';
import { exportToCSV } from './utils/csv';
import { searchBusinesses } from './utils/maps';
import type { Business, APIConfig } from './types';
import { Configuracoes } from './pages/Configuracoes';
import { GestaoLeads } from './pages/GestaoLeads';
import { Login } from './pages/Login';
import { MapPin } from 'lucide-react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';

type ViewMode = 'table' | 'kanban';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig>({ key: '' });
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    const savedBusinesses = localStorage.getItem('businesses');
    if (savedBusinesses) {
      setBusinesses(JSON.parse(savedBusinesses));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey');
    if (savedApiKey) {
      setApiConfig({ key: savedApiKey });
    }
  }, []);

  useEffect(() => {
    if (apiConfig.key) {
      localStorage.setItem('apiKey', apiConfig.key);
    }
  }, [apiConfig.key]);

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
        alert(error.message === 'Nenhum resultado encontrado para esta busca'
          ? 'Nenhum resultado encontrado. Tente ajustar sua pesquisa.'
          : 'Erro ao processar a busca. Verifique a URL e a chave da API.');
      } else {
        alert('Erro desconhecido ao processar a busca.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (businesses.length > 0) {
      exportToCSV(businesses, 'empresas-google-maps.csv');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-gray-50 text-gray-900'}`}>
      <div className={isAuthenticated ? 'ml-64' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              {isAuthenticated && <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
              <div className={`max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 ${isAuthenticated ? 'ml-64' : ''}`}>
                <div className="px-4 py-8 sm:px-0">
                  <div className="mb-12 text-center">
                    <div className="flex items-center justify-center mb-6">
                      <MapPin className="h-14 w-14 text-blue-600 animate-bounce" />
                    </div>
                    <h1 className={`text-4xl font-bold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      Gerenciador de Listagens do Google Maps
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Importe dados do Google Maps de forma simples e eficiente
                    </p>
                  </div>

                  <div className="space-y-10">
                    <div className={`max-w-2xl mx-auto rounded-xl shadow-lg p-6 transition-shadow hover:shadow-xl ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'}`}>
                      <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
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
                      <>
                        <div className="flex justify-end gap-2 mb-4">
                          <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                          >
                            Visualização em Tabela
                          </button>
                          <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-4 py-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                          >
                            Visualização Kanban
                          </button>
                        </div>

                        {viewMode === 'table' ? (
                          <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'}`}>
                            <BusinessTable businesses={businesses} onExportCSV={handleExportCSV} />
                          </div>
                        ) : (
                          <KanbanBoard
                            businesses={businesses}
                            onStatusChange={(business, newStatus) => {
                              const updatedBusinesses = businesses.map(b => 
                                b.name === business.name ? { ...b, status: newStatus } : b
                              );
                              setBusinesses(updatedBusinesses);
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 py-8 sm:px-0">
                  <Configuracoes
                    apiConfig={apiConfig}
                    onSave={(config) => setApiConfig(config)}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                  />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/gestao-leads" element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 py-8 sm:px-0">
                  <GestaoLeads businesses={businesses} />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
