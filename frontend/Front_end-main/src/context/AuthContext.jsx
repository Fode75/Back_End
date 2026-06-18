// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

// URL du backend — à définir dans Coolify via VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || ''

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('vbot-token'))
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('vbot-user')
    return u ? JSON.parse(u) : null
  })

  const isLoggedIn = !!token

  function login(token, user) {
    setToken(token)
    setUser(user)
    localStorage.setItem('vbot-token', token)
    localStorage.setItem('vbot-user', JSON.stringify(user))
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('vbot-token')
    localStorage.removeItem('vbot-user')
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
