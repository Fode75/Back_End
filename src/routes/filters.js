// src/routes/filters.js
const express = require('express')
const prisma = require('../prisma')
const auth = require('../middleware/auth')
const router = express.Router()

router.use(auth)
router.get('/', async (req, res) => {
  try { res.json(await prisma.filter.findMany({ where: { userId: req.user.id } })) }
  catch { res.status(500).json({ message: 'Erreur serveur.' }) }
})
router.post('/', async (req, res) => {
  const { name, brands, budget, discount, keywords, sizes } = req.body
  if (!name) return res.status(400).json({ message: 'Nom requis.' })
  try { res.status(201).json(await prisma.filter.create({ data: { userId: req.user.id, name, brands, budget: parseFloat(budget) || null, discount: parseInt(discount) || 40, keywords, sizes } })) }
  catch { res.status(500).json({ message: 'Erreur serveur.' }) }
})
router.put('/:id', async (req, res) => {
  const { name, active, brands, budget, discount, keywords, sizes } = req.body
  try { await prisma.filter.updateMany({ where: { id: parseInt(req.params.id), userId: req.user.id }, data: { name, active, brands, budget: parseFloat(budget) || null, discount: parseInt(discount) || 40, keywords, sizes } }); res.json({ ok: true }) }
  catch { res.status(500).json({ message: 'Erreur serveur.' }) }
})
router.delete('/:id', async (req, res) => {
  try { await prisma.filter.deleteMany({ where: { id: parseInt(req.params.id), userId: req.user.id } }); res.json({ message: 'Supprimé.' }) }
  catch { res.status(500).json({ message: 'Erreur serveur.' }) }
})

module.exports = router
