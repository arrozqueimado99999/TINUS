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
    <div className="min-h-screen bg-white text-slate-100 flex flex-col md:flex-row font-sans selection:bg-amber-500/30">
      <Navigation />
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar for Desktop */}
        {/*<header className="hidden md:flex items-center justify-between px-8 py-4 backdrop-blur-md">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Painel Operacional Trade Marketing</h2>
            <p className="text-xs text-slate-400">Gestão integrada de demandas, grupos e equipe</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-2 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </header>*/}

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
