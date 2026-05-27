// src/routes/deals.js
// Routes pour les bons plans.
// GET  /api/deals     → récupérer tous les deals
// GET  /api/deals/:id → récupérer un seul deal
// POST /api/deals     → ajouter un deal (utilisé par le bot)

const express = require('express')
const pool = require('../db/database')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// ───────────────────────────────────────────
// GET /api/deals — Récupérer tous les deals
// ───────────────────────────────────────────
// authMiddleware vérifie que l'utilisateur est connecté avant d'accéder
router.get('/', authMiddleware, async (req, res) => {
  try {
    // On peut filtrer par catégorie si le paramètre est passé dans l'URL
    // Ex: /api/deals?category=Sneakers
    const { category } = req.query

    let query = 'SELECT * FROM deals ORDER BY created_at DESC'
    let params = []

    if (category && category !== 'Tous') {
      query = 'SELECT * FROM deals WHERE category = $1 ORDER BY created_at DESC'
      params = [category]
    }

    const result = await pool.query(query, params)
    res.json(result.rows)

  } catch (err) {
    console.error('Erreur GET deals:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ───────────────────────────────────────────
// GET /api/deals/:id — Récupérer un seul deal
// ───────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM deals WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Deal introuvable.' })
    }

    res.json(result.rows[0])

  } catch (err) {
    console.error('Erreur GET deal:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ───────────────────────────────────────────
// POST /api/deals — Ajouter un deal (bot)
// ───────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, brand, price, original_price, score, condition, city, url, category, image } = req.body

  if (!name || !price) {
    return res.status(400).json({ message: 'Nom et prix requis.' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO deals (name, brand, price, original_price, score, condition, city, url, category, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, brand, price, original_price, score, condition, city, url, category, image]
    )

    res.status(201).json(result.rows[0])

  } catch (err) {
    console.error('Erreur POST deal:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
