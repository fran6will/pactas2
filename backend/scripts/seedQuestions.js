// backend/scripts/seedQuestions.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// IDs des organisations existantes
const organizations = [
  'cm3tonrik000dvj8t6e9p095a',  // capy
  '8000700c-0802-40a2-9a58-d2698fbaacf3',  // org1
];

// IDs des utilisateurs existants pour les paris
const users = [
  '0c47f443-8d03-4599-b2b5-372e78b1bca9',  // user@example.com
  'e84c5b22-3436-439a-acbd-65fbf8b1e7a4',  // francis
  '8ebc9090-eda5-4a9a-99aa-3b89a9e61234',  // fran@gmail.com
  '968a8287-a65c-4aec-94c9-ea9a1ea81234'   // xaxa@gmail.com
];

const questionTemplates = [
  {
    title: "La France remportera-t-elle un Oscar en 2025 ?",
    description: "Prédiction sur le succès du cinéma français aux Oscars 2025.",
    tags: ['ART_CULTURE', 'DIVERTISSEMENT'],
    minBet: 50,
    maxBet: 300,
    organization: organizations[0]
  },
  {
    title: "Le Québec aura-t-il un hiver plus doux que la normale en 2025 ?",
    description: "Prédiction basée sur les prévisions météorologiques à long terme.",
    tags: ['ENVIRONNEMENT'],
    minBet: 30,
    maxBet: 200,
    organization: organizations[1]
  },
  {
    title: "La STM augmentera-t-elle ses tarifs en 2025 ?",
    description: "Prédiction sur l'évolution des tarifs de transport en commun à Montréal.",
    tags: ['SOCIAL', 'ECONOMIE'],
    minBet: 20,
    maxBet: 150,
    organization: organizations[0]
  },
  {
    title: "Le CF Montréal atteindra-t-il les séries en 2025 ?",
    description: "Prédiction sur la performance du CF Montréal en MLS.",
    tags: ['SPORT'],
    minBet: 40,
    maxBet: 250,
    organization: organizations[1]
  },
  {
    title: "Un nouveau studio de jeux vidéo majeur s'installera-t-il à Montréal en 2025 ?",
    description: "Prédiction sur l'expansion de l'industrie du jeu vidéo à Montréal.",
    tags: ['TECHNOLOGIE', 'ECONOMIE'],
    minBet: 60,
    maxBet: 400,
    organization: organizations[0]
  }
];

function getRandomDateIn2025() {
  const start = new Date('2025-01-01');
  const end = new Date('2025-12-31');
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generateQuestions() {
  try {
    console.log('Début de la génération des questions...');

    for (const template of questionTemplates) {
      // Créer la question
      const question = await prisma.question.create({
        data: {
          title: template.title,
          description: template.description,
          deadline: getRandomDateIn2025(),
          source: "https://example.com/sources/prediction",
          status: 'active',
          organizationId: template.organization,
          tags: template.tags
        }
      });

      console.log(`Question créée: ${template.title}`);

      // Générer des paris aléatoires
      const numBets = Math.floor(Math.random() * 6) + 5; // 5 à 10 paris
      
      for (let i = 0; i < numBets; i++) {
        const betAmount = Math.floor(Math.random() * (template.maxBet - template.minBet)) + template.minBet;
        const userId = users[Math.floor(Math.random() * users.length)];
        const prediction = Math.random() > 0.5 ? 'yes' : 'no';

        // Vérifier si l'utilisateur existe avant de créer le pari
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
          console.error(`Utilisateur avec ID ${userId} non trouvé. Pari ignoré.`);
          continue; // Ignorer ce pari et passer au suivant
        }

        try {
          // Créer le pari
          await prisma.bet.create({
            data: {
              userId,
              questionId: question.id,
              amount: betAmount,
              prediction
            }
          });

          // Créer la transaction
          await prisma.transaction.create({
            data: {
              userId,
              amount: -betAmount,
              type: 'bet',
              questionId: question.id
            }
          });

          // Mettre à jour les tokens de l'utilisateur
          await prisma.user.update({
            where: { id: userId },
            data: {
              tokens: {
                decrement: betAmount
              }
            }
          });

          console.log(`Pari créé pour la question "${template.title}": ${betAmount}$ sur "${prediction}"`);
        } catch (betError) {
          console.error(`Erreur lors de la création du pari pour l'utilisateur ${userId}:`, betError);
        }
      }
    }

    console.log('Génération des données terminée avec succès !');
  } catch (error) {
    console.error('Erreur lors de la génération des données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateQuestions()
  .then(() => console.log('Script terminé !'))
  .catch(console.error);
