// src/prisma.js
// Instance unique de Prisma Client partagée dans toute l'app

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma
