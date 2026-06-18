// src/pages/NotFound/NotFound.jsx
import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

function NotFound() {
  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Page introuvable</h1>
      <p className={styles.text}>Cette page n'existe pas.</p>
      <Link to="/" className={styles.btn}>Retour au Dashboard</Link>
    </div>
  )
}

export default NotFound
