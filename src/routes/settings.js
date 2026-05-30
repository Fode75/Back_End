// src/routes/settings.js
const express = require('express')
const prisma = require('../prisma')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { userId: req.user.id } })
    if (!settings) {
      settings = await prisma.settings.create({ data: { userId: req.user.id } })
    }
    res.json(settings)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

router.put('/', async (req, res) => {
  const { minDiscount, minScore, scanInterval, discord, email } = req.body
  try {
    const settings = await prisma.settings.update({
      where: { userId: req.user.id },
      data: { minDiscount: parseInt(minDiscount), minScore: parseInt(minScore), scanInterval: parseInt(scanInterval), discord, email }
    })
    res.json(settings)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
