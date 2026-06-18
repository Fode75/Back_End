// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Dashboard from './pages/Dashboard/Dashboard'
import Deals from './pages/Deals/Deals'
import Filters from './pages/Filters/Filters'
import Settings from './pages/Settings/Settings'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import NotFound from './pages/NotFound/NotFound'
import { AuthProvider } from './context/AuthContext'
import { BotProvider } from './context/BotContext'
import styles from './App.module.css'

function App() {
  return (
    <AuthProvider>
      <BotProvider>
        <div className={styles.app}>
          <Navbar />
          <main className={styles.main}>
            <Routes>
              {/* Toutes les pages sont accessibles */}
              {/* Recherches et Paramètres = visibles mais interaction bloquée sans compte */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/bons-plans" element={<Deals />} />
              <Route path="/recherches" element={<Filters />} />
              <Route path="/parametres" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BotProvider>
    </AuthProvider>
  )
}

export default App
