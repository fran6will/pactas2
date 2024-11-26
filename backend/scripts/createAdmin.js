// scripts/createAdmin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin(email, password, name) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('❌ Un utilisateur avec cet email existe déjà');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isAdmin: true,
        tokens: 1000 // Donner un solde initial
      }
    });

    console.log(`✅ Administrateur créé avec succès :`);
    console.log(`Email: ${admin.email}`);
    console.log(`Nom: ${admin.name}`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer les arguments de la ligne de commande
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

if (!email || !password || !name) {
  console.error('❌ Veuillez fournir email, mot de passe et nom.');
  console.error('Usage: node createAdmin.js email@example.com motdepasse "Nom Admin"');
  process.exit(1);
}

createAdmin(email, password, name);