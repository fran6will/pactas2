// backend/scripts/addTokens.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTokens(email, amount) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        tokens: {
          increment: amount
        }
      }
    });
    console.log(`Tokens ajoutés! Nouveau solde pour ${user.name}: ${user.tokens} tokens`);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ajouter 1000 tokens à l'utilisateur test
addTokens('test@example.com', 1000);