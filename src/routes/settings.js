// src/routes/settings.js
// Routes pour les paramètres du bot.
// GET /api/settings     → récupérer les paramètres de l'utilisateur
// PUT /api/settings     → modifier les paramètres

const express = require('express')
const pool = require('../db/database')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.use(authMiddleware)

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM settings WHERE user_id = $1',
      [req.user.id]
    )

    // Si l'utilisateur n'a pas encore de settings → on crée les valeurs par défaut
    if (result.rows.length === 0) {
      const newSettings = await pool.query(
        'INSERT INTO settings (user_id) VALUES ($1) RETURNING *',
        [req.user.id]
      )
      return res.json(newSettings.rows[0])
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur GET settings:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// PUT /api/settings
router.put('/', async (req, res) => {
  const { min_discount, min_score, scan_interval, telegram, discord, email } = req.body

  try {
    const result = await pool.query(
      `UPDATE settings
       SET min_discount=$1, min_score=$2, scan_interval=$3, telegram=$4, discord=$5, email=$6
       WHERE user_id=$7 RETURNING *`,
      [min_discount, min_score, scan_interval, telegram, discord, email, req.user.id]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur PUT settings:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
