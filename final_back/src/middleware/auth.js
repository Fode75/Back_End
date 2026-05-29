// src/middleware/auth.js
// Middleware = une fonction qui s'exécute AVANT la route.
// Son rôle : vérifier que l'utilisateur est bien connecté (token valide).
// Si le token est invalide → on renvoie une erreur 401.
// Si le token est valide → on laisse passer vers la route.

const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  // Le token est envoyé dans le header "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // on récupère juste le token

  if (!token) {
    return res.status(401).json({ message: 'Token manquant. Tu dois être connecté.' })
  }

  try {
    // On vérifie que le token est valide avec notre clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // On ajoute l'utilisateur décodé à la requête pour l'utiliser dans la route
    req.user = decoded
    next() // tout est ok → on passe à la route
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' })
  }
}

module.exports = authMiddleware
