// src/pages/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDiscount } from '../../data/deals'
import { fetchDeals } from '../../api/dealsApi'
import { useAuth } from '../../context/AuthContext'
import styles from './Dashboard.module.css'

function Dashboard() {
  const { API_URL, token } = useAuth()
  const [dealsList, setDealsList] = useState([])
  const [aiResponse, setAiResponse] = useState('Clique sur "Analyser IA" sur une alerte, ou pose une question ci-dessous.')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInput, setAiInput] = useState('')

  useEffect(() => {
    fetchDeals(API_URL, { token })
      .then(setDealsList)
      .catch(() => setDealsList([]))
  }, [API_URL, token])

  const recent = dealsList.slice(0, 3)
  const withDiscount = dealsList.filter(d => getDiscount(d.price, d.originalPrice) > 0)
  const avgDiscount = withDiscount.length
    ? Math.round(withDiscount.reduce((a, d) => a + getDiscount(d.price, d.originalPrice), 0) / withDiscount.length)
    : 0

  async function askClaude(prompt) {
    if (!token) return
    setAiLoading(true)
    setAiResponse('')
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setAiResponse(data.response || 'Pas de réponse.')
    } catch {
      setAiResponse('Erreur de connexion à l\'IA.')
    }
    setAiLoading(false)
  }

  function handleAnalyze(deal) {
    const orig = deal.originalPrice ? ` au lieu de ${deal.originalPrice}€ (−${getDiscount(deal.price, deal.originalPrice)}%)` : ''
    askClaude(`Analyse cette annonce Vinted : "${deal.name}" (${deal.brand}) à ${deal.price}€${orig}. État : ${deal.condition}. Score : ${deal.score}/100. Bonne affaire ?`)
  }

  function handleSend() {
    if (!aiInput.trim()) return
    askClaude(aiInput)
    setAiInput('')
  }

  return (
    <div className={styles.page}>
      <section className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{dealsList.length > 0 ? dealsList.length * 120 : '—'}</span>
          <span className={styles.statLabel}>Annonces scannées</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--accent)' }}>{dealsList.length}</span>
          <span className={styles.statLabel}>Bons plans</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--green)' }}>{avgDiscount || '—'}%</span>
          <span className={styles.statLabel}>Réduction moy.</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Alertes récentes</h2>
          <Link to="/bons-plans" className={styles.seeAll}>Voir tout →</Link>
        </div>
        <div className={styles.alerts}>
          {recent.length > 0 ? recent.map(deal => (
            <div key={deal.id} className={styles.alertCard}>
              <div className={styles.alertThumb}>
                {deal.image ? <img src={deal.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : deal.emoji}
              </div>
              <div className={styles.alertInfo}>
                <p className={styles.alertName}>{deal.name}</p>
                <p className={styles.alertMeta}>{deal.condition}{deal.city ? ` · ${deal.city}` : ''}</p>
                <span className={`${styles.scoreBadge} ${deal.score >= 90 ? styles.hot : styles.good}`}>
                  {deal.score >= 90 ? '🔥' : '✓'} Score {deal.score}/100
                </span>
              </div>
              <div className={styles.alertRight}>
                <p className={styles.alertPrice}>{deal.price} €</p>
                {getDiscount(deal.price, deal.originalPrice) > 0 && (
                  <p className={styles.alertDiscount}>−{getDiscount(deal.price, deal.originalPrice)}%</p>
                )}
                {token && (
                  <button type="button" className={styles.btnAnalyze} onClick={() => handleAnalyze(deal)}>Analyser IA</button>
                )}
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--muted)', padding: '1rem' }}>Aucune alerte pour le moment — le bot alimentera cette liste.</p>
          )}
        </div>
      </section>

      <section className={styles.aiPanel}>
        <div className={styles.aiHeader}>✨ Analyse IA — Claude</div>
        <div className={styles.aiBody}>
          {aiLoading ? <p className={styles.aiLoading}>Analyse en cours...</p> : <p>{aiResponse}</p>}
        </div>
        <div className={styles.aiInput}>
          <input
            type="text"
            placeholder={token ? 'Ex: Quel est le meilleur prix pour des Jordan 1 ?' : 'Connectez-vous pour utiliser l\'IA'}
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={!token}
          />
          <button type="button" onClick={handleSend} disabled={!token}>Envoyer</button>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
