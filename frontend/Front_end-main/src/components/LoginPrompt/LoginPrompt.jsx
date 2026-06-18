// src/components/LoginPrompt/LoginPrompt.jsx
// Popup qui s'affiche quand on essaie d'utiliser une feature sans être connecté

import { Link } from 'react-router-dom'
import styles from './LoginPrompt.module.css'

function LoginPrompt({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.icon}>🔒</div>
        <h2 className={styles.title}>Connexion requise</h2>
        <p className={styles.text}>Tu dois être connecté pour utiliser cette fonctionnalité.</p>
        <div className={styles.actions}>
          <Link to="/register" className={styles.btnPrimary}>Créer un compte</Link>
          <Link to="/login" className={styles.btnSecondary}>Se connecter</Link>
        </div>
        <button className={styles.close} onClick={onClose}>✕</button>
      </div>
    </div>
  )
}

export default LoginPrompt
