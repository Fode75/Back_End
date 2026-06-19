// src/middleware/auth.js
const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token manquant.' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Token invalide.' })
  }
}

module.exports = authMiddleware
