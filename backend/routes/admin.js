require('dotenv').config(); // Assurez-vous d'avoir configuré dotenv

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { emailService } = require('../services/email.service');


const prisma = new PrismaClient();

// Log pour le middleware authenticateAdmin
router.use((req, res, next) => {
  console.log('Admin route accessed:', req.path);
  console.log('Auth header:', req.headers.authorization);
  next();
});

// Middleware pour vérifier si l'utilisateur est admin
router.use(authenticateAdmin);

router.get('/questions', async (req, res) => {
    try {
      const questions = await prisma.question.findMany({
        include: {
          bets: true,
          organization: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      const questionsWithTotals = questions.map(question => {
        const bets = question.bets || [];
        
        // Calcul correct des totaux
        const totalYes = bets
          .filter(bet => bet.prediction === 'yes')
          .reduce((sum, bet) => parseFloat(bet.amount) + sum, 0);
  
        const totalNo = bets
          .filter(bet => bet.prediction === 'no')
          .reduce((sum, bet) => parseFloat(bet.amount) + sum, 0);
  
        // Retirer les bets de la réponse pour éviter la redondance
        const { bets: _, ...questionData } = question;
  
        return {
          ...questionData,
          totalYes: parseFloat(totalYes.toFixed(2)),
          totalNo: parseFloat(totalNo.toFixed(2)),
          totalPool: parseFloat((totalYes + totalNo).toFixed(2))
        };
      });
  
      console.log('Questions avec totaux:', questionsWithTotals);
      res.json(questionsWithTotals);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

// Dans routes/admin.js, ajoutez ces routes

// Récupérer toutes les organisations avec leurs transactions
router.get('/organizations', async (req, res) => {
    try {
      const organizations = await prisma.organization.findMany({
        include: {
          // Inclure les dernières transactions
          _count: {
            select: {
              questions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      // Récupérer les transactions pour chaque organisation
      const orgsWithTransactions = await Promise.all(
        organizations.map(async (org) => {
          const transactions = await prisma.transaction.findMany({
            where: { orgId: org.id },
            orderBy: { createdAt: 'desc' },
            take: 5 // Limiter aux 5 dernières transactions
          });
  
          return {
            ...org,
            transactions,
            questionCount: org._count.questions
          };
        })
      );
  
      res.json(orgsWithTransactions);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  // Récupérer les détails d'une organisation spécifique
  router.get('/organizations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
          questions: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              questions: true
            }
          }
        }
      });
  
      if (!organization) {
        return res.status(404).json({ error: 'Organisation non trouvée' });
      }
  
      // Récupérer les transactions de l'organisation
      const transactions = await prisma.transaction.findMany({
        where: { orgId: id },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
  
      res.json({
        ...organization,
        transactions,
        questionCount: organization._count.questions
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

// Créer une nouvelle question
router.post('/questions', async (req, res) => {
  try {
    const { title, description, organization, deadline, source } = req.body;

    // Chercher ou créer l'organisation basée sur le nom
    const org = await prisma.organization.upsert({
      where: { name: organization },
      update: {},
      create: {
        name: organization,
        description: `Organisation créée automatiquement pour ${organization}`,
        wallet: 0,
      },
    });

    const question = await prisma.question.create({
      data: {
        title,
        description,
        organizationId: org.id,
        deadline: new Date(deadline),
        source,
        status: 'active',
      },
      include: {
        organization: true,
      },
    });

    res.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la question', details: error.message });
  }
});

// Modifier une question
router.put('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, organization, deadline, source } = req.body;

    // Chercher ou créer l'organisation basée sur le nom
    const org = await prisma.organization.upsert({
      where: { name: organization },
      update: {},
      create: {
        name: organization,
        description: `Organisation créée automatiquement pour ${organization}`,
        wallet: 0,
      },
    });

    const question = await prisma.question.update({
      where: { id },
      data: {
        title,
        description,
        organizationId: org.id,
        deadline: new Date(deadline),
        source,
      },
      include: {
        organization: true,
      },
    });

    res.json(question);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la question' });
  }
});

// Changer le statut d'une question
router.post('/questions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const question = await prisma.question.update({
      where: { id },
      data: { status },
    });

    res.json(question);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur lors du changement de statut' });
  }
});

// Dans routes/admin.js
// Dans routes/admin.js
// Route pour résoudre une question
router.post('/questions/:id/resolve', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { resolution } = req.body;
  
    try {
      const result = await prisma.$transaction(async (prisma) => {
        // 1. Vérifications initiales
        const question = await prisma.question.findUnique({
          where: { id },
          include: {
            bets: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true
                  }
                }
              }
            },
            organization: {
              include: {
                user: {
                  select: {
                    email: true,
                    name: true
                  }
                }
              }
            }
          },
        });
  
        if (!question) throw new Error('Question non trouvée');
        if (question.status !== 'closed') throw new Error('La question doit être fermée avant résolution');
  
        // 2. Calculs des parts
        const totalPool = question.bets.reduce((sum, bet) => sum + Number(bet.amount), 0);
        const adminShare = totalPool * 0.05; // 5% pour l'admin
        const remainingAfterAdmin = totalPool - adminShare;
        const organizationShare = remainingAfterAdmin * 0.5; // 47.5% du total
        const winnersPool = remainingAfterAdmin - organizationShare; // 47.5% du total
  
        const winningBets = question.bets.filter(bet => bet.prediction === resolution);
        const totalWinningBets = winningBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
  
        // 3. Part admin (5%)
        const admin = await prisma.user.findFirst({
          where: { isAdmin: true }
        });
  
        if (admin) {
          await prisma.user.update({
            where: { id: admin.id },
            data: { tokens: { increment: adminShare } }
          });
  
          await prisma.transaction.create({
            data: {
              userId: admin.id,
              amount: adminShare,
              type: 'admin_fee',
              questionId: question.id,
              orgId: null
            }
          });
        }
  
        // 4. Part organisation (47.5%)
        await prisma.organization.update({
          where: { id: question.organizationId },
          data: { wallet: { increment: organizationShare } }
        });
  
        await prisma.transaction.create({
          data: {
            orgId: question.organizationId,
            amount: organizationShare,
            type: 'commission',
            questionId: question.id,
            userId: null
          }
        });
  
        // 5. Distribution aux gagnants (47.5%)
        const winnerResults = [];
        for (const bet of winningBets) {
          const winnerShare = (Number(bet.amount) / totalWinningBets) * winnersPool;
          
          // Mise à jour des tokens du gagnant
          await prisma.user.update({
            where: { id: bet.userId },
            data: { tokens: { increment: winnerShare } }
          });
  
          // Création de la transaction
          const transaction = await prisma.transaction.create({
            data: {
              userId: bet.userId,
              amount: winnerShare,
              type: 'win',
              questionId: question.id,
              orgId: null
            }
          });
  
          winnerResults.push({
            userId: bet.userId,
            amount: winnerShare,
            transactionId: transaction.id
          });
        }
  
        // 6. Envoi des notifications email
        
        // Email à l'organisation
        try {
          await emailService.sendEmail({
            to: question.organization.user.email,
            subject: `Question "${question.title}" résolue`,
            template: 'question-resolved-notification',
            data: {
              organizationName: question.organization.name,
              questionTitle: question.title,
              resolution: resolution === 'yes' ? 'OUI' : 'NON',
              totalPool: totalPool,
              organizationShare: organizationShare,
              totalBets: question.bets.length,
              resolvedAt: new Date().toISOString(),
              questionUrl: `${process.env.FRONTEND_URL}/question/${question.id}`
            }
          });
        } catch (error) {
          console.error('Erreur lors de l\'envoi de l\'email à l\'organisation:', error);
        }
  
        // Emails aux parieurs
        const emailPromises = question.bets.map(async (bet) => {
          if (!bet.user?.email) {
            console.warn(`Pari ignoré car l'utilisateur ou l'email est manquant (userId: ${bet.userId})`);
            return;
          }
  
          const isWinner = bet.prediction === resolution;
          const winAmount = isWinner ? winnerResults.find(w => w.userId === bet.userId)?.amount : 0;
  
          try {
            await emailService.sendEmail({
              to: bet.user.email,
              subject: `Résultat de votre pari sur "${question.title}"`,
              template: 'bet-resolution-notification',
              data: {
                userName: bet.user.name,
                questionTitle: question.title,
                betAmount: bet.amount,
                prediction: bet.prediction === 'yes' ? 'OUI' : 'NON',
                actualResult: resolution === 'yes' ? 'OUI' : 'NON',
                hasWon: isWinner,
                winAmount: winAmount,
                questionUrl: `${process.env.FRONTEND_URL}/question/${question.id}`
              }
            });
          } catch (error) {
            console.error(`Erreur lors de l'envoi de l'email à ${bet.user.email}:`, error);
          }
        });
  
        // Attendre que tous les emails soient envoyés
        await Promise.allSettled(emailPromises);
  
        // 7. Finalisation
        const updatedQuestion = await prisma.question.update({
          where: { id },
          data: {
            status: resolution === 'yes' ? 'resolved_yes' : 'resolved_no',
            resolvedAt: new Date()
          }
        });
  
        return {
          question: updatedQuestion,
          totalPool,
          distributions: {
            adminShare,
            organizationShare,
            winnersPool
          },
          winnerResults,
          emailsSent: true
        };
      });
  
      res.json({
        success: true,
        message: 'Question résolue, gains distribués et notifications envoyées avec succès',
        data: result
      });
  
    } catch (error) {
      console.error('Erreur complète:', error);
      res.status(500).json({
        error: 'Erreur lors de la résolution de la question',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
// Route pour vérifier si l'utilisateur est admin
router.get('/check', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ isAdmin: false });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isAdmin: true },
    });

    res.json({ isAdmin: user?.isAdmin || false });
  } catch (error) {
    res.json({ isAdmin: false });
  }
});


router.post('/organizations/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
      
        // Vérifier que l'organisation existe
        const organization = await prisma.organization.findUnique({
          where: { id },
          include: {
            user: true
          }
        });
      
        if (!organization) {
          return res.status(404).json({ error: 'Organisation non trouvée' });
        }
      
        // Mettre à jour le statut de l'organisation
        const updatedOrg = await prisma.organization.update({
          where: { id },
          data: { 
            status: 'approved'
          },
          include: {
            user: true
          }
        });
      
        // Envoyer un email de confirmation
        try {
          await emailService.sendEmail({
            to: updatedOrg.user.email,
            subject: 'Organisation approuvée',
            template: 'organization-approved',
            data: {
              organizationName: updatedOrg.name,
              loginUrl: process.env.FRONTEND_URL + '/auth'
            }
          });
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailError);
          // Continue l'exécution même si l'envoi d'email échoue
        }
      
        res.json(updatedOrg);
      } catch (error) {
        console.error('Error approving organization:', error);
        res.status(500).json({ error: 'Erreur lors de l\'approbation de l\'organisation' });
      }
});

router.post('/organizations/:id/reject', async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
  
      if (!reason) {
        return res.status(400).json({ error: 'La raison du rejet est requise' });
      }
  
      // Vérifier que l'organisation existe
      const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
          user: true
        }
      });
  
      if (!organization) {
        return res.status(404).json({ error: 'Organisation non trouvée' });
      }
  
      // Mettre à jour le statut de l'organisation
      const updatedOrg = await prisma.organization.update({
        where: { id },
        data: { 
          status: 'rejected'
        },
        include: {
          user: true
        }
      });
  
      // Envoyer un email de notification
      try {
        await emailService.sendEmail({
          to: updatedOrg.user.email,
          subject: 'Demande d\'organisation rejetée',
          template: 'organization-rejected',
          data: {
            organizationName: updatedOrg.name,
            reason: reason,
            supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
          }
        });
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de rejet:', emailError);
        // Continue l'exécution même si l'envoi d'email échoue
      }
  
      res.json(updatedOrg);
    } catch (error) {
      console.error('Error rejecting organization:', error);
      res.status(500).json({ 
        error: 'Erreur lors du rejet de l\'organisation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });


router.get('/withdrawals/pending', authenticateAdmin, async (req, res) => {
    try {
      const pendingWithdrawals = await prisma.withdrawal.findMany({
        where: { status: 'pending' },
        include: {
          organization: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(pendingWithdrawals);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  // Marquer un retrait comme complété
  router.post('/withdrawals/:id/complete', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await prisma.$transaction(async (tx) => {
        // 1. Trouver le retrait
        const withdrawal = await tx.withdrawal.findUnique({
          where: { id },
          include: { organization: true }
        });
  
        if (!withdrawal || withdrawal.status !== 'pending') {
          throw new Error('Retrait non trouvé ou déjà traité');
        }
  
        // 2. Mettre à jour le retrait
        const updatedWithdrawal = await tx.withdrawal.update({
          where: { id },
          data: {
            status: 'completed',
            processedAt: new Date()
          }
        });
  
        // 3. Créer une transaction
        await tx.transaction.create({
          data: {
            orgId: withdrawal.organizationId,
            amount: -withdrawal.amount,
            type: 'withdrawal',
            status: 'completed'
          }
        });
  
        // 4. Mettre à jour le solde de l'organisation
        await tx.organization.update({
          where: { id: withdrawal.organizationId },
          data: {
            wallet: {
              decrement: withdrawal.amount
            }
          }
        });
  
        // 5. Envoyer un email de confirmation
        const emailService = require('../services/email.service');
        await emailService.sendEmail({
          to: withdrawal.organization.email,
          subject: 'Retrait traité',
          template: 'withdrawal-processed',
          data: {
            amount: withdrawal.amount,
            organizationName: withdrawal.organization.name
          }
        });
  
        return updatedWithdrawal;
      });
  
      res.json(result);
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Rejeter un retrait
  router.post('/withdrawals/:id/reject', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
  
      if (!reason) {
        return res.status(400).json({ error: 'Motif de rejet requis' });
      }
  
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id },
        include: { organization: true }
      });
  
      if (!withdrawal || withdrawal.status !== 'pending') {
        return res.status(404).json({ error: 'Retrait non trouvé ou déjà traité' });
      }
  
      const result = await prisma.withdrawal.update({
        where: { id },
        data: {
          status: 'rejected',
          error: reason
        }
      });
  
      // Envoyer un email
      const emailService = require('../services/email.service');
      await emailService.sendEmail({
        to: withdrawal.organization.email,
        subject: 'Demande de retrait rejetée',
        template: 'withdrawal-rejected',
        data: {
          amount: withdrawal.amount,
          organizationName: withdrawal.organization.name,
          reason
        }
      });
  
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
