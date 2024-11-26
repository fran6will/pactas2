// backend/scripts/createTestQuestion.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestQuestion() {
  try {
    const question = await prisma.question.create({
      data: {
        title: "Le Bitcoin dépassera-t-il 100k$ en 2024?",
        description: "Prédiction sur le prix du Bitcoin",
        organization: "CryptoQuébec",
        deadline: new Date('2024-12-31'),
        source: "CoinGecko API",
        status: "active"
      }
    });
    console.log('Question de test créée:', question);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestQuestion();