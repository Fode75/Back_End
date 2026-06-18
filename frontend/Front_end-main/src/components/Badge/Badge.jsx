// src/components/Badge/Badge.jsx
import styles from './Badge.module.css'

function Badge({ label, active, onClick }) {
  return (
    <span
      className={`${styles.badge} ${active ? styles.active : ''} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      {label}
    </span>
  )
}

export default Badge
