// src/pages/Deals/Deals.jsx
import { useState, useEffect } from 'react'
import { getDiscount } from '../../data/deals'
import { fetchDeals, getCategoriesFromDeals } from '../../api/dealsApi'
import DealCard from '../../components/DealCard/DealCard'
import SearchBar from '../../components/SearchBar/SearchBar'
import Badge from '../../components/Badge/Badge'
import { useAuth } from '../../context/AuthContext'
import styles from './Deals.module.css'

function Deals() {
  const { API_URL, token } = useAuth()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tous')
  const [dealsList, setDealsList] = useState([])
  const [categories, setCategories] = useState(['Tous'])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [aiDeal, setAiDeal] = useState(null)
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const data = await fetchDeals(API_URL, { token })
        if (!cancelled) {
          setDealsList(data)
          setCategories(getCategoriesFromDeals(data))
        }
      } catch {
        if (!cancelled) {
          setLoadError('Impossible de charger les bons plans depuis l\'API.')
          setDealsList([])
        }
      }
      if (!cancelled) setLoading(false)
    }
    load()
    const id = setInterval(load, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [API_URL, token])

  useEffect(() => {
    let result = [...dealsList]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) || (d.brand || '').toLowerCase().includes(q)
      )
    }
    if (category !== 'Tous') result = result.filter(d => d.category === category)
    setFiltered(result)
  }, [search, category, dealsList])

  async function handleAnalyze(deal) {
    if (!token) return
    setAiDeal(deal)
    setAiLoading(true)
    setAiResponse('')
    setTimeout(() => document.getElementById('ai-panel')?.scrollIntoView({ behavior: 'smooth' }), 100)
    const orig = deal.originalPrice ? ` au lieu de ${deal.originalPrice}€ (−${getDiscount(deal.price, deal.originalPrice)}%)` : ''
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prompt: `Analyse : "${deal.name}" (${deal.brand}) à ${deal.price}€${orig}. État : ${deal.condition}. Score : ${deal.score}/100. Bonne affaire ?`,
        }),
      })
      const data = await res.json()
      setAiResponse(data.response || 'Pas de réponse.')
    } catch {
      setAiResponse('Erreur de connexion.')
    }
    setAiLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bons plans</h1>
        <p className={styles.sub}>
          {loading ? 'Chargement...' : `${filtered.length} article${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {loadError && <p className={styles.error}>{loadError}</p>}

      <div className={styles.toolbar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un article..." />
        <div className={styles.filters}>
          {categories.map(cat => (
            <Badge key={cat} label={cat} active={category === cat} onClick={() => setCategory(cat)} />
          ))}
        </div>
      </div>

      {!loading && filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map(deal => <DealCard key={deal.id} deal={deal} onAnalyze={token ? handleAnalyze : undefined} />)}
        </div>
      ) : !loading ? (
        <div className={styles.empty}>
          <p>🔍</p>
          <h2>Aucun résultat</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            {dealsList.length === 0
              ? 'Le bot n\'a pas encore envoyé de deals. Activez RUN_BOT=true sur Render.'
              : 'Essayez un autre filtre.'}
          </p>
          <button type="button" onClick={() => { setSearch(''); setCategory('Tous') }}>Réinitialiser</button>
        </div>
      ) : null}

      {aiDeal && (
        <div id="ai-panel" className={styles.aiPanel}>
          <div className={styles.aiHeader}>✨ Analyse IA — {aiDeal.name}</div>
          <div className={styles.aiBody}>
            {aiLoading ? <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Analyse en cours...</p> : <p>{aiResponse}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Deals
