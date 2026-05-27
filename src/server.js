// src/server.js
// Point d'entrée du backend. C'est ce fichier qui démarre le serveur.

// dotenv charge les variables du fichier .env
require('dotenv').config()

const express = require('express')
const cors = require('cors')

// On importe toutes les routes
const authRoutes = require('./routes/auth')
const dealsRoutes = require('./routes/deals')
const filtersRoutes = require('./routes/filters')
const settingsRoutes = require('./routes/settings')
const aiRoutes = require('./routes/ai')

const app = express()
const PORT = process.env.PORT || 3000

// ── Middlewares globaux ──────────────────────────────
// cors() permet au frontend (vinted.octilabs.com) d'appeler ce backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// express.json() permet de lire le body des requêtes POST/PUT en JSON
app.use(express.json())

// ── Routes ──────────────────────────────────────────
// Chaque route est préfixée par /api/...
app.use('/api/auth', authRoutes)       // login, register
app.use('/api/deals', dealsRoutes)     // bons plans
app.use('/api/filters', filtersRoutes) // filtres sauvegardés
app.use('/api/settings', settingsRoutes) // paramètres
app.use('/api', aiRoutes)              // analyse IA

// ── Route de test ────────────────────────────────────
// Permet de vérifier que le serveur tourne : GET /
app.get('/', (req, res) => {
  res.json({ message: '✅ VintedBot API is running!' })
})

// ── Démarrage ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
})
