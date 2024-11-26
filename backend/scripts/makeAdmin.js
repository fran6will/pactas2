// scripts/makeAdmin.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true }
    });

    console.log(`✅ L'utilisateur ${user.email} est maintenant administrateur`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments de la ligne de commande
const email = process.argv[2];
if (!email) {
  console.error('❌ Veuillez fournir un email. Usage: node makeAdmin.js email@example.com');
  process.exit(1);
}

makeAdmin(email);