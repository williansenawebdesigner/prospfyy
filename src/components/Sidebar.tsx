import { NavLink } from 'react-router-dom';
import { MapPin, Home, Building2, Settings, Moon, Sun, KanbanSquare } from 'lucide-react';

export function Sidebar({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  return (
    <div className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r h-screen fixed left-0 top-0 p-6 transition-colors duration-200`}>
      <div className={`flex items-center gap-2 mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        <MapPin className="h-8 w-8 text-blue-600" />
        <h2 className="text-xl font-semibold">Gerenciador</h2>
      </div>

      <nav className="space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) => 
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive 
                ? `${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'}`
                : `${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`
            }`
          }
        >
          <Home className="h-5 w-5 mr-3" />
          Dashboard
        </NavLink>

        <NavLink
          to="/empresas"
          className={({ isActive }) => 
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive 
                ? `${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'}`
                : `${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`
            }`
          }
        >
          <Building2 className="h-5 w-5 mr-3" />
          Empresas
        </NavLink>

        <NavLink
          to="/configuracoes"
          className={({ isActive }) => 
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive 
                ? `${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'}`
                : `${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`
            }`
          }
        >
          <Settings className="h-5 w-5 mr-3" />
          Configurações
        </NavLink>

        <NavLink
          to="/gestao-leads"
          className={({ isActive }) => 
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive 
                ? `${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'}`
                : `${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`
            }`
          }
        >
          <KanbanSquare className="h-5 w-5 mr-3" />
          Gestão de Leads
        </NavLink>
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>
    </div>
  );
}
