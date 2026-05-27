// src/routes/filters.js
// Routes pour les filtres sauvegardés.
// GET    /api/filters     → récupérer les filtres de l'utilisateur connecté
// POST   /api/filters     → créer un nouveau filtre
// PUT    /api/filters/:id → modifier un filtre
// DELETE /api/filters/:id → supprimer un filtre

const express = require('express')
const pool = require('../db/database')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// Toutes les routes filtres nécessitent d'être connecté
router.use(authMiddleware)

// GET /api/filters
router.get('/', async (req, res) => {
  try {
    // req.user.id = l'id de l'utilisateur connecté (décodé depuis le token JWT)
    const result = await pool.query(
      'SELECT * FROM filters WHERE user_id = $1 ORDER BY id ASC',
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Erreur GET filters:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// POST /api/filters
router.post('/', async (req, res) => {
  const { name, brands, budget, discount, keywords, sizes } = req.body

  if (!name) {
    return res.status(400).json({ message: 'Le nom du filtre est requis.' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO filters (user_id, name, brands, budget, discount, keywords, sizes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, name, brands, budget, discount, keywords, sizes]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Erreur POST filter:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// PUT /api/filters/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { name, active, brands, budget, discount, keywords, sizes } = req.body

  try {
    // On vérifie que le filtre appartient bien à l'utilisateur connecté
    const result = await pool.query(
      `UPDATE filters SET name=$1, active=$2, brands=$3, budget=$4, discount=$5, keywords=$6, sizes=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [name, active, brands, budget, discount, keywords, sizes, id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Filtre introuvable.' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Erreur PUT filter:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// DELETE /api/filters/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    await pool.query('DELETE FROM filters WHERE id=$1 AND user_id=$2', [id, req.user.id])
    res.json({ message: 'Filtre supprimé.' })
  } catch (err) {
    console.error('Erreur DELETE filter:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
