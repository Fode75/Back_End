// src/components/Navbar/Navbar.jsx
import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useBot } from '../../context/BotContext'
import { useAuth } from '../../context/AuthContext'
import styles from './Navbar.module.css'

function Navbar() {
  const { savedDeals, botActive } = useBot()
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <span className={styles.accent}>⚡</span>
          XELOR<span className={styles.light}>bot</span>
        </NavLink>

        {/* Burger button mobile */}
        <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={menuOpen ? styles.burgerLineOpen : styles.burgerLine} />
          <span className={menuOpen ? styles.burgerLineOpen : styles.burgerLine} />
          <span className={menuOpen ? styles.burgerLineOpen : styles.burgerLine} />
        </button>

        {/* Links */}
        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {[
            { to: '/', label: 'Dashboard', end: true },
            { to: '/bons-plans', label: 'Bons plans' },
            { to: '/recherches', label: 'Recherches' },
            { to: '/parametres', label: 'Paramètres' },
          ].map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                onClick={() => setMenuOpen(false)}
              >
                {label}
                {to === '/bons-plans' && savedDeals.length > 0 && (
                  <span className={styles.badge}>{savedDeals.length}</span>
                )}
              </NavLink>
            </li>
          ))}

          {/* Mobile auth */}
          <li className={styles.mobileAuth}>
            {isLoggedIn ? (
              <button className={styles.logoutBtn} onClick={handleLogout}>Déconnexion</button>
            ) : (
              <Link to="/login" className={styles.loginBtn} onClick={() => setMenuOpen(false)}>
                Connexion
              </Link>
            )}
          </li>
        </ul>

        {/* Desktop right */}
        <div className={styles.right}>
          <div className={`${styles.status} ${botActive ? styles.on : styles.off}`}>
            <span className={styles.dot} />
            {botActive ? 'Bot actif' : 'Arrêté'}
          </div>
          {isLoggedIn ? (
            <button className={styles.logoutBtn} onClick={handleLogout}>Déconnexion</button>
          ) : (
            <Link to="/login" className={styles.loginBtn}>Connexion</Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
