// backend/routes/transactions.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateUser = require('../middleware/authenticateUser');

const prisma = new PrismaClient();

// Obtenir les transactions d'un utilisateur
router.get('/user', authenticateUser, async (req, res) => {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { 
          userId: req.user.id 
        },
        include: {
          question: {
            select: {
              id: true,
              title: true,
              organization: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

     // Formater les transactions pour l'affichage
     const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        createdAt: tx.createdAt,
        status: tx.status,
        questionId: tx.question?.id || null,
        questionTitle: tx.question?.title || null,
        organizationName: tx.question?.organization?.name || null,
        prediction: tx.prediction // Si vous stockez la prédiction
      }));

      res.json(formattedTransactions);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
    }
  });




// Obtenir les transactions d'un utilisateur avec pagination
router.get('/user', authenticateUser, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: req.user.id 
      },
      include: {
        question: {
          select: {
            title: true,
            organization: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les transactions pour l'affichage
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      createdAt: tx.createdAt,
      status: tx.status,
      questionId: tx.questionId,
      questionTitle: tx.question?.title || null,
      organizationName: tx.question?.organization?.name || null,
      prediction: tx.type === 'bet' ? tx.prediction : null
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
});

// Obtenir les statistiques de l'utilisateur
router.get('/users/stats', authenticateUser, async (req, res) => {
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

// Obtenir les paris actifs de l'utilisateur
router.get('/users/active-questions', authenticateUser, async (req, res) => {
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

    // Formater les questions pour inclure les informations de paris
    const formattedQuestions = activeQuestions.map(question => {
      const userBet = question.bets[0]; // Le pari de l'utilisateur pour cette question
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







// Obtenir les transactions d'une organisation
router.get('/organization', authenticateUser, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est lié à une organisation
    const organization = await prisma.organization.findUnique({
      where: { userId: req.user.id }
    });

    if (!organization) {
      return res.status(403).json({ error: 'Organisation non trouvée' });
    }

    // Récupérer toutes les transactions liées aux questions de l'organisation
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { orgId: organization.id },
          {
            question: {
              organizationId: organization.id
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        question: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les transactions pour l'affichage
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      createdAt: tx.createdAt,
      questionTitle: tx.question?.title || null,
      userName: tx.user?.name || 'Anonyme',
      userEmail: tx.user?.email || null
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
});

module.exports = router;