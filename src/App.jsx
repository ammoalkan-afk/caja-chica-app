import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Gastos from './pages/Gastos'
import Reposiciones from './pages/Reposiciones'
import Usuarios from './pages/Usuarios'

function FullScreenLoader() {
  return (
    <div className="app-canvas-bg flex min-h-screen items-center justify-center">
      <p className="text-sm text-ink-muted">Cargando…</p>
    </div>
  )
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireAdmin({ children }) {
  const { perfil, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (perfil?.rol !== 'admin') return <Navigate to="/gastos" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/gastos" replace />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/reposiciones" element={<Reposiciones />} />
            <Route
              path="/usuarios"
              element={
                <RequireAdmin>
                  <Usuarios />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/gastos" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
