// src/routes/auth.js
// Login et Register avec Prisma

const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Mot de passe trop court (6 min).' })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    })

    // Crée les paramètres par défaut
    await prisma.settings.create({ data: { userId: user.id } })

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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
    }

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
