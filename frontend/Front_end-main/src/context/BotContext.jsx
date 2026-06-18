// src/context/BotContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const BotContext = createContext()

export function BotProvider({ children }) {
  const [savedDeals, setSavedDeals] = useState(() => {
    const s = localStorage.getItem('vbot-saved')
    return s ? JSON.parse(s) : []
  })
  const [botActive, setBotActive] = useState(true)

  useEffect(() => {
    localStorage.setItem('vbot-saved', JSON.stringify(savedDeals))
  }, [savedDeals])

  function toggleSaved(id) {
    setSavedDeals(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  function isSaved(id) { return savedDeals.includes(id) }

  return (
    <BotContext.Provider value={{ savedDeals, toggleSaved, isSaved, botActive, setBotActive }}>
      {children}
    </BotContext.Provider>
  )
}

export function useBot() { return useContext(BotContext) }
