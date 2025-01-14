import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Empresas } from './pages/Empresas';
import { GestaoLeads } from './pages/GestaoLeads';
import { Configuracoes } from './pages/Configuracoes';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthProvider';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/empresas"
            element={
              <ProtectedLayout>
                <Empresas />
              </ProtectedLayout>
            }
          />

          <Route
            path="/gestao-leads"
            element={
              <ProtectedLayout>
                <GestaoLeads />
              </ProtectedLayout>
            }
          />

          <Route
            path="/configuracoes"
            element={
              <ProtectedLayout>
                <Configuracoes />
              </ProtectedLayout>
            }
          />

          {/* Redirecionar rotas não encontradas para o dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
