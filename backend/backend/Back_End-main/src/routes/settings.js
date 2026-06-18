// src/routes/settings.js
const express = require('express')
const prisma = require('../prisma')
const auth = require('../middleware/auth')
const router = express.Router()

router.use(auth)
router.get('/', async (req, res) => {
  try {
    let s = await prisma.settings.findUnique({ where: { userId: req.user.id } })
    if (!s) s = await prisma.settings.create({ data: { userId: req.user.id } })
    res.json(s)
  } catch { res.status(500).json({ message: 'Erreur serveur.' }) }
})
router.put('/', async (req, res) => {
  const { minDiscount, minScore, scanInterval, discord, email } = req.body
  try { res.json(await prisma.settings.update({ where: { userId: req.user.id }, data: { minDiscount: parseInt(minDiscount), minScore: parseInt(minScore), scanInterval: parseInt(scanInterval), discord, email } })) }
  catch { res.status(500).json({ message: 'Erreur serveur.' }) }
})

module.exports = router
