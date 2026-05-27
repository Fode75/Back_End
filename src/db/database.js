// src/db/database.js
// Ce fichier crée la connexion à PostgreSQL.
// On utilise le package "pg" qui permet de faire des requêtes SQL depuis Node.js.

const { Pool } = require('pg')

// Pool = un groupe de connexions réutilisables (plus efficace qu'une seule connexion)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Si tu es en production (Coolify), SSL est requis
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// On teste la connexion au démarrage
pool.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion base de données:', err.message)
  } else {
    console.log('✅ Connecté à PostgreSQL')
  }
})

// On exporte le pool pour l'utiliser dans les routes
module.exports = pool
