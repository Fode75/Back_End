// src/pages/Filters/Filters.jsx
// Visible par tous mais interaction bloquée sans compte
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import LoginPrompt from '../../components/LoginPrompt/LoginPrompt'
import styles from './Filters.module.css'

const defaultFilters = [
  { id: 1, name: '👟 Sneakers', active: true, brands: 'Nike, Adidas, New Balance', budget: 150, discount: 50, keywords: ['Jordan 1', 'Forum Low'], sizes: ['42', '43'] },
  { id: 2, name: '👜 Maroquinerie', active: true, brands: 'Jacquemus, Totême', budget: 200, discount: 40, keywords: ['Le Bambino'], sizes: [] },
  { id: 3, name: '🎮 High-tech', active: false, brands: 'Sony, Apple', budget: 400, discount: 35, keywords: ['PS5', 'AirPods'], sizes: [] },
  { id: 4, name: '🧥 Vêtements', active: true, brands: 'The North Face, Carhartt', budget: 120, discount: 55, keywords: ['Manteau'], sizes: ['M', 'L'] },
]

function Filters() {
  const { isLoggedIn } = useAuth()
  const [filters, setFilters] = useState(defaultFilters)
  const [showPrompt, setShowPrompt] = useState(false)

  function requireLogin(action) {
    if (!isLoggedIn) { setShowPrompt(true); return }
    action()
  }

  function toggleFilter(id) {
    requireLogin(() => setFilters(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f)))
  }

  function deleteFilter(id) {
    requireLogin(() => setFilters(prev => prev.filter(f => f.id !== id)))
  }

  return (
    <div className={styles.page}>
      {showPrompt && <LoginPrompt onClose={() => setShowPrompt(false)} />}

      <div className={styles.header}>
        <h1 className={styles.title}>Recherches sauvegardées</h1>
        <p className={styles.sub}>{filters.filter(f => f.active).length} actives · {filters.length} au total</p>
        {!isLoggedIn && (
          <div className={styles.banner}>
            🔒 Connecte-toi pour gérer tes recherches
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {filters.map(filter => (
          <div key={filter.id} className={`${styles.card} ${!filter.active ? styles.inactive : ''}`}>
            <div className={styles.cardHead}>
              <h2 className={styles.filterName}>{filter.name}</h2>
              <label className={styles.toggle} onClick={() => toggleFilter(filter.id)}>
                <div className={`${styles.slider} ${filter.active ? styles.sliderOn : ''}`}>
                  <div className={styles.sliderThumb} />
                </div>
              </label>
            </div>
            <div className={styles.rows}>
              <div className={styles.row}><span>Marques</span><span className={styles.val}>{filter.brands}</span></div>
              <div className={styles.row}><span>Budget max</span><span className={styles.val}>{filter.budget} €</span></div>
              <div className={styles.row}><span>Réduction min.</span><span className={styles.val}>{filter.discount}%</span></div>
            </div>
            {filter.keywords.length > 0 && (
              <div className={styles.tags}>
                {filter.keywords.map(k => <span key={k} className={styles.tag}>{k}</span>)}
                {filter.sizes.map(s => <span key={s} className={styles.tagSize}>T.{s}</span>)}
              </div>
            )}
            <button className={styles.deleteBtn} onClick={() => deleteFilter(filter.id)}>Supprimer</button>
          </div>
        ))}
      </div>

      <button className={styles.addBtn} onClick={() => requireLogin(() => alert('Formulaire à venir'))}>
        + Nouvelle recherche
      </button>
    </div>
  )
}

export default Filters
