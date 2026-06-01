// src/index.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const dealsRoutes = require('./routes/deals')
const filtersRoutes = require('./routes/filters')
const settingsRoutes = require('./routes/settings')
const aiRoutes = require('./routes/ai')

const app = express()
const PORT = process.env.PORT || 3000
const frontendOrigin = process.env.FRONTEND_URL || 'https://vinted.octilabs.com'

app.use(cors({
  origin: [frontendOrigin, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/deals', dealsRoutes)
app.use('/api/filters', filtersRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api', aiRoutes)

app.get('/', (req, res) => {
  res.json({ message: '✅ VintedBot API is running!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
})
