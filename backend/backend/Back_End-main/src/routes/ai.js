// src/routes/ai.js
const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/analyze', auth, async (req, res) => {
  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ message: 'Prompt requis.' })
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, system: "Expert Vinted. Analyse en 3 phrases max. Verdict clair : acheter ou passer. En français.", messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await response.json()
    res.json({ response: data.content?.map(b => b.text || '').join('') || 'Pas de réponse.' })
  } catch { res.status(500).json({ message: 'Erreur IA.' }) }
})

module.exports = router
