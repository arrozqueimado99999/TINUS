import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthProvider'
import Dashboard from './Dashboard'
import DemandasPage from './DemandasPage'
import GruposPage from './GruposPage'
import UsuariosPage from './UsuariosPage'
import LoginPage from './LoginPage'
import Navigation from './Navigation'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return user ? children : <Navigate to="/login" replace />
}

function RoleProtectedRoute({ children }) {
  const { perfil, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  const cargo = (perfil?.cargo || '').toString().trim().toLowerCase()
  const podeGerenciarUsuarios = cargo === 'gerente' || cargo === 'supervisor'

  return podeGerenciarUsuarios ? children : <Navigate to="/" replace />
}

function AuthenticatedApp() {
  return (
    <div className="max-h-screen bg-background scrollbar-none rounded-3xl flex flex-col md:flex-row font-sans selection:bg-verdi">
      <Navigation />
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Content Canvas */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/demandas" element={<DemandasPage />} />
              <Route path="/grupos" element={<GruposPage />} />
              <Route
                path="/usuarios"
                element={
                  <RoleProtectedRoute>
                    <UsuariosPage />
                  </RoleProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
