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
    <>
      <Navigation />
      <main className="min-h-screen pb-24 sm:pb-6 md:ml-64">
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
      </main>
    </>
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
