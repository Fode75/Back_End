-- db/schema.sql
-- Structure de la base de données VintedBot.
-- Donne ce fichier à ton collègue pour qu'il crée les tables.

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,        -- mot de passe chiffré avec bcrypt
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des bons plans détectés par le bot
CREATE TABLE IF NOT EXISTS deals (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  brand          VARCHAR(100),
  price          DECIMAL NOT NULL,
  original_price DECIMAL,
  score          INT DEFAULT 0,
  condition      VARCHAR(100),
  city           VARCHAR(100),
  url            TEXT,
  category       VARCHAR(100),
  image          TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Table des filtres sauvegardés (liés à un utilisateur)
CREATE TABLE IF NOT EXISTS filters (
  id       SERIAL PRIMARY KEY,
  user_id  INT REFERENCES users(id) ON DELETE CASCADE,
  name     VARCHAR(100) NOT NULL,
  active   BOOLEAN DEFAULT true,
  brands   TEXT,
  budget   DECIMAL,
  discount INT DEFAULT 40,
  keywords TEXT,
  sizes    TEXT
);

-- Table des paramètres du bot (liés à un utilisateur)
CREATE TABLE IF NOT EXISTS settings (
  id            SERIAL PRIMARY KEY,
  user_id       INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  min_discount  INT DEFAULT 40,
  min_score     INT DEFAULT 70,
  scan_interval INT DEFAULT 5,
  telegram      BOOLEAN DEFAULT true,
  discord       BOOLEAN DEFAULT false,
  email         BOOLEAN DEFAULT true
);
