// src/components/SearchBar/SearchBar.jsx
import styles from './SearchBar.module.css'

function SearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>🔍</span>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && <button className={styles.clear} onClick={() => onChange('')}>✕</button>}
    </div>
  )
}

export default SearchBar
