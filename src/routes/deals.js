// src/routes/deals.js
const express = require('express')
const prisma = require('../prisma')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const { category } = req.query
    const where = category && category !== 'Tous' ? { category } : {}
    const deals = await prisma.deal.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(deals)
  } catch { res.status(500).json({ message: 'Erreur serveur.' }) }
})

router.post('/', async (req, res) => {
  const { name, brand, price, originalPrice, score, condition, city, url, category, image } = req.body
  if (!name || !price) return res.status(400).json({ message: 'Nom et prix requis.' })
  try {
    const deal = await prisma.deal.create({
      data: { name, brand, price: parseFloat(price), originalPrice: parseFloat(originalPrice) || null, score: parseInt(score) || 0, condition, city, url, category, image }
    })
    res.status(201).json(deal)
  } catch { res.status(500).json({ message: 'Erreur serveur.' }) }
})

module.exports = router
