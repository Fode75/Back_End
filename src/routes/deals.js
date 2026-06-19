// src/routes/deals.js
const express = require('express')
const prisma = require('../prisma')
const auth = require('../middleware/auth')
const router = express.Router()

function formatDeal(deal) {
  if (!deal) return deal
  return {
    ...deal,
    originalPrice: deal.originalPrice,
    original_price: deal.originalPrice,
    created_at: deal.createdAt,
  }
}

function parseBody(body) {
  const originalPrice = body.originalPrice ?? body.original_price
  return {
    name: body.name,
    brand: body.brand || null,
    price: parseFloat(body.price),
    originalPrice: originalPrice != null && originalPrice !== '' ? parseFloat(originalPrice) : null,
    score: parseInt(body.score, 10) || 0,
    condition: body.condition || null,
    city: body.city || null,
    url: body.url || null,
    category: body.category || null,
    image: body.image || null,
  }
}

// GET /api/deals — public (affichage site sans login)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    const where = category && category !== 'Tous' ? { category } : {}
    const deals = await prisma.deal.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 })
    res.json(deals.map(formatDeal))
  } catch (err) {
    console.error('Erreur GET deals:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// GET /api/deals/mine — avec JWT (usage futur)
router.get('/mine', auth, async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(deals.map(formatDeal))
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

router.post('/', async (req, res) => {
  const data = parseBody(req.body)
  if (!data.name || Number.isNaN(data.price)) {
    return res.status(400).json({ message: 'Nom et prix requis.' })
  }
  try {
    if (data.url) {
      const existing = await prisma.deal.findFirst({ where: { url: data.url } })
      if (existing) return res.status(200).json(formatDeal(existing))
    }
    const deal = await prisma.deal.create({ data })
    res.status(201).json(formatDeal(deal))
  } catch (err) {
    console.error('Erreur POST deal:', err.message)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
