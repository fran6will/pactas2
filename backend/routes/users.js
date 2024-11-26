// backend/routes/users.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateUser = require('../middleware/authenticateUser');

const prisma = new PrismaClient();

// Statistiques de l'utilisateur
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    // Récupérer tous les paris de l'utilisateur
    const bets = await prisma.bet.findMany({
      where: { userId: req.user.id },
      include: {
        question: true
      }
    });

    // Compter les questions actives
    const activeQuestions = await prisma.question.count({
      where: {
        bets: {
          some: {
            userId: req.user.id
          }
        },
        status: 'active'
      }
    });

    // Calculer les statistiques
    let wonBets = 0;
    let totalWinnings = 0;
    let totalLosses = 0;

    bets.forEach(bet => {
      if (bet.question.status === 'resolved_yes' && bet.prediction === 'yes' ||
          bet.question.status === 'resolved_no' && bet.prediction === 'no') {
        wonBets++;
        totalWinnings += Number(bet.amount);
      } else if (bet.question.status.startsWith('resolved_')) {
        totalLosses += Number(bet.amount);
      }
    });

    const stats = {
      totalBets: bets.length,
      wonBets,
      lostBets: bets.length - wonBets,
      totalWinnings,
      totalLosses,
      winRate: bets.length ? wonBets / bets.length : 0,
      activeQuestions
    };

    res.json(stats);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Questions actives de l'utilisateur
router.get('/active-questions', authenticateUser, async (req, res) => {
  try {
    const activeQuestions = await prisma.question.findMany({
      where: {
        bets: {
          some: {
            userId: req.user.id
          }
        },
        status: 'active'
      },
      include: {
        organization: {
          select: {
            name: true
          }
        },
        bets: {
          where: {
            userId: req.user.id
          }
        },
        _count: {
          select: {
            bets: true
          }
        }
      }
    });

    const formattedQuestions = activeQuestions.map(question => {
      const userBet = question.bets[0];
      const totalBets = question._count.bets;

      return {
        id: question.id,
        title: question.title,
        description: question.description,
        organization: question.organization.name,
        deadline: question.deadline,
        status: question.status,
        userBet: {
          amount: userBet.amount,
          prediction: userBet.prediction,
          createdAt: userBet.createdAt
        },
        totalBets,
        totalPool: question.totalPool || 0
      };
    });

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paris actifs' });
  }
});

module.exports = router;