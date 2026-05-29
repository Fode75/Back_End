// src/routes/auth.js
// Routes pour la connexion et l'inscription.
// POST /api/auth/register → créer un compte
// POST /api/auth/login    → se connecter

const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../db/database')

const router = express.Router()

// ───────────────────────────────────────────
// POST /api/auth/register — Créer un compte
// ───────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password } = req.body

  // Vérification : les champs sont-ils remplis ?
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit faire au moins 6 caractères.' })
  }

  try {
    // Vérifie si l'email existe déjà
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' })
    }

    // Chiffre le mot de passe avec bcrypt (10 = niveau de sécurité)
    // On ne stocke JAMAIS un mot de passe en clair dans la BDD
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insère le nouvel utilisateur dans la BDD
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    )

    const user = result.rows[0]

    // Crée les paramètres par défaut pour ce nouvel utilisateur
    await pool.query('INSERT INTO settings (user_id) VALUES ($1)', [user.id])

    // Génère un token JWT valable 7 jours
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user: { id: user.id, email: user.email } })

  } catch (err) {
    console.error('Erreur register:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ───────────────────────────────────────────
// POST /api/auth/login — Se connecter
// ───────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' })
  }

  try {
    // Cherche l'utilisateur par email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
    }

    const user = result.rows[0]

    // Compare le mot de passe tapé avec le hash stocké en BDD
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
    }

    // Génère un token JWT valable 7 jours
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, email: user.email } })

  } catch (err) {
    console.error('Erreur login:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
