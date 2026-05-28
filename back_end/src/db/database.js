// src/db/database.js
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

pool.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion base de données:', err.message)
  } else {
    console.log('✅ Connecté à PostgreSQL')
  }
})

module.exports = pool
