// src/routes/ai.js
// Proxy vers Claude API — la clé reste côté serveur
const express = require('express')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.post('/analyze', authMiddleware, async (req, res) => {
  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ message: 'Prompt requis.' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: "Tu es un expert en bonnes affaires sur Vinted. Analyse en 3-4 phrases. Verdict clair : acheter ou passer. En français.",
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await response.json()
    const text = data.content?.map(b => b.text || '').join('') || 'Pas de réponse.'
    res.json({ response: text })
  } catch (err) {
    res.status(500).json({ message: 'Erreur IA.' })
  }
})

module.exports = router
