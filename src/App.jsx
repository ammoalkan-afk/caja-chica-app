import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Gastos from './pages/Gastos'
import Reposiciones from './pages/Reposiciones'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/gastos" replace />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/reposiciones" element={<Reposiciones />} />
          <Route path="*" element={<Navigate to="/gastos" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
