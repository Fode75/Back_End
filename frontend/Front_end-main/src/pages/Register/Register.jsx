// src/pages/Register/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Register.module.css'

function Register() {
  const { login, API_URL } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Mot de passe trop court (6 min)'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Erreur inscription'); return }
      login(data.token, data.user)
      navigate('/')
    } catch {
      setError('Impossible de joindre le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}><span className={styles.accent}>⚡</span> VINTED<span className={styles.light}>BOT</span></div>
        <h1 className={styles.title}>Créer un compte</h1>
        <p className={styles.sub}>Rejoins le bot et trouve les meilleures affaires</p>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Mot de passe</label>
            <input type="password" placeholder="6 caractères min." value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Confirmer</label>
            <input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        <p className={styles.footer}>Déjà un compte ? <Link to="/login" className={styles.link}>Se connecter</Link></p>
      </div>
    </div>
  )
}

export default Register
