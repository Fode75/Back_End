// src/db/database.js
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

// On teste juste la connexion sans la garder ouverte
pool.query('SELECT 1')
  .then(() => console.log('✅ Connecté à PostgreSQL'))
  .catch(err => console.error('❌ Erreur BDD:', err.message))

module.exports = pool
