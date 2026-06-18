// src/pages/Settings/Settings.jsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import LoginPrompt from '../../components/LoginPrompt/LoginPrompt'
import styles from './Settings.module.css'

function Settings() {
  const { isLoggedIn } = useAuth()
  const [showPrompt, setShowPrompt] = useState(false)
  const [settings, setSettings] = useState({ minDiscount: 40, minScore: 70, scanInterval: 5, discord: false, email: true })

  function requireLogin(key, value) {
    if (!isLoggedIn) { setShowPrompt(true); return }
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={styles.page}>
      {showPrompt && <LoginPrompt onClose={() => setShowPrompt(false)} />}

      <div className={styles.header}>
        <h1 className={styles.title}>Paramètres</h1>
        {!isLoggedIn && <div className={styles.banner}>🔒 Connecte-toi pour modifier les paramètres</div>}
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Seuils de détection</h2>
          <div className={styles.row}>
            <div><p className={styles.label}>Réduction minimale</p><p className={styles.desc}>% pour déclencher une alerte</p></div>
            <div className={styles.inputGroup}>
              <input type="number" className={styles.input} value={settings.minDiscount} min={0} max={100}
                onChange={e => requireLogin('minDiscount', Number(e.target.value))} onClick={() => !isLoggedIn && setShowPrompt(true)} />
              <span className={styles.unit}>%</span>
            </div>
          </div>
          <div className={styles.row}>
            <div><p className={styles.label}>Score minimum</p><p className={styles.desc}>Score IA minimum (0-100)</p></div>
            <div className={styles.inputGroup}>
              <input type="number" className={styles.input} value={settings.minScore} min={0} max={100}
                onChange={e => requireLogin('minScore', Number(e.target.value))} onClick={() => !isLoggedIn && setShowPrompt(true)} />
              <span className={styles.unit}>/100</span>
            </div>
          </div>
          <div className={styles.row}>
            <div><p className={styles.label}>Fréquence de scan</p><p className={styles.desc}>Toutes les N minutes</p></div>
            <div className={styles.inputGroup}>
              <input type="number" className={styles.input} value={settings.scanInterval} min={1}
                onChange={e => requireLogin('scanInterval', Number(e.target.value))} onClick={() => !isLoggedIn && setShowPrompt(true)} />
              <span className={styles.unit}>min</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Notifications</h2>
          <div className={styles.row}>
            <div><p className={styles.label}>Discord</p><p className={styles.desc}>Webhook Discord</p></div>
            <div className={`${styles.toggle} ${settings.discord ? styles.toggleOn : ''}`}
              onClick={() => requireLogin('discord', !settings.discord)}>
              <div className={styles.thumb} />
            </div>
          </div>
          <div className={styles.row}>
            <div><p className={styles.label}>Email</p><p className={styles.desc}>Résumé quotidien</p></div>
            <div className={`${styles.toggle} ${settings.email ? styles.toggleOn : ''}`}
              onClick={() => requireLogin('email', !settings.email)}>
              <div className={styles.thumb} />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Exclusions</h2>
          <div className={styles.rowV}>
            <p className={styles.label}>Mots-clés exclus</p>
            <p className={styles.desc}>Annonces à ignorer</p>
            <input type="text" className={styles.inputFull} defaultValue="replica, fake, cassé"
              onClick={() => !isLoggedIn && setShowPrompt(true)} readOnly={!isLoggedIn} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
