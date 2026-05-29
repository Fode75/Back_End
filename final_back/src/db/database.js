// src/db/database.js
// Connexion à PostgreSQL via le package "pg"

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false  // pas de SSL sur Coolify en réseau interne
})

pool.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion base de données:', err.message)
  } else {
    console.log('✅ Connecté à PostgreSQL')
  }
})

module.exports = pool
