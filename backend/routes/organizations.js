// backend/routes/organizations.js
require('dotenv').config(); // Assurez-vous d'avoir configuré dotenv

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateUser = require('../middleware/authenticateUser');
const { emailService } = require('../services/email.service');

const prisma = new PrismaClient();

// Middleware pour vérifier si l'utilisateur est une organisation
const isOrganization = async (req, res, next) => {
    console.log('Vérification organisation pour user:', req.user);
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { organization: true }
      });
  
      console.log('User trouvé:', user);
  
      if (!user || user.userType !== 'organization') {
        console.log('Accès refusé: user n\'est pas une organisation');
        return res.status(403).json({ 
          error: 'Accès réservé aux organisations',
          details: 'L\'utilisateur n\'a pas le type organization'
        });
      }
  
      if (!user.organization) {
        console.log('Accès refusé: pas d\'organisation associée');
        return res.status(403).json({ 
          error: 'Accès réservé aux organisations',
          details: 'Aucune organisation associée à cet utilisateur'
        });
      }
  
      req.organization = user.organization; // Stocker l'organisation pour usage ultérieur
      next();
    } catch (error) {
      console.error('Erreur dans isOrganization middleware:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la vérification de l\'organisation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

// Route pour obtenir les questions d'une organisation spécifique par ID
router.get('/:id/questions', async (req, res) => {
    try {
      console.log('Fetching questions for organization:', req.params.id);
  
      const questions = await prisma.question.findMany({
        where: {
          organizationId: req.params.id,
        },
        include: {
          bets: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      // Formater les questions
      const formattedQuestions = questions.map(question => {
        const totalYes = question.bets
          .filter(bet => bet.prediction === 'yes')
          .reduce((sum, bet) => sum + Number(bet.amount), 0);
        const totalNo = question.bets
          .filter(bet => bet.prediction === 'no')
          .reduce((sum, bet) => sum + Number(bet.amount), 0);
  
        const { bets, ...questionData } = question;
        return {
          ...questionData,
          totalYes,
          totalNo,
          totalPool: totalYes + totalNo,
        };
      });
  
      res.json(formattedQuestions);
    } catch (error) {
      console.error('Error fetching organization questions:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  // Mettre à jour le profil (protégé)
  router.put('/profile', authenticateUser, async (req, res) => {
    try {
      const organization = await prisma.organization.findUnique({
        where: { userId: req.user.id }
      });
  
      if (!organization) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
  
      // Liste des champs autorisés à être mis à jour
      const allowedFields = [
        'name',
        'description',
        'email',
        'phone',
        'website',
        'mission',
        'vision',
        'team',
        'fundingGoals',
        'impact',
        'twitterUrl',
        'linkedinUrl',
        'facebookUrl'
      ];
  
      // Filtrer les champs à mettre à jour
      const updateData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
  
      const updatedOrganization = await prisma.organization.update({
        where: { id: organization.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          description: true,
          email: true,
          phone: true,
          website: true,
          mission: true,
          vision: true,
          team: true,
          fundingGoals: true,
          impact: true,
          twitterUrl: true,
          linkedinUrl: true,
          facebookUrl: true
        }
      });
  
      res.json(updatedOrganization);
    } catch (error) {
      console.error('Error updating organization profile:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
  });
  

// Route pour le profile (mise à jour)
router.put('/profile', async (req, res) => {
    try {
      const updatedOrg = await prisma.organization.update({
        where: { id: req.body.id },
        data: {
          name: req.body.name,
          description: req.body.description,
          email: req.body.email,
          phone: req.body.phone,
          website: req.body.website,
          mission: req.body.mission,
          vision: req.body.vision,
          team: req.body.team,
          fundingGoals: req.body.fundingGoals,
          impact: req.body.impact,
          twitterUrl: req.body.twitterUrl,
          linkedinUrl: req.body.linkedinUrl,
          facebookUrl: req.body.facebookUrl,
        }
      });
  
      res.json(updatedOrg);
    } catch (error) {
      console.error('Error updating organization:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
  });


// Route pour obtenir les questions d'une organisation
router.get('/questions', authenticateUser, isOrganization, async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      where: {
        organization: {
          userId: req.user.id,
        },
      },
      include: {
        bets: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculer les totaux pour chaque question
    const questionsWithTotals = questions.map((question) => {
      const totalYes = question.bets
        .filter((bet) => bet.prediction === 'yes')
        .reduce((sum, bet) => sum + Number(bet.amount), 0);

      const totalNo = question.bets
        .filter((bet) => bet.prediction === 'no')
        .reduce((sum, bet) => sum + Number(bet.amount), 0);

      const { bets, ...questionData } = question;

      return {
        ...questionData,
        totalYes,
        totalNo,
        totalPool: totalYes + totalNo,
      };
    });

    res.json(questionsWithTotals);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour créer une nouvelle question
// Route pour créer une nouvelle question
router.post('/questions', authenticateUser, isOrganization, async (req, res) => {
    console.log('=== Début de la création de question ===');
    console.log('Données reçues:', req.body);
    
    try {
      // Vérifier d'abord le nombre de questions disponibles
      const organization = await prisma.organization.findUnique({
        where: { id: req.organization.id }
      });

      if (!organization || organization.availableQuestions <= 0) {
        return res.status(403).json({
          error: 'Pas de questions disponibles',
          code: 'NO_QUESTIONS_AVAILABLE'
        });
      }

      const { title, description, deadline, source, tags } = req.body;
  
      // Validation des données requises
      if (!title || !description || !deadline || !source) {
        return res.status(400).json({
          error: 'Données manquantes',
          details: 'Tous les champs requis doivent être fournis (title, description, deadline, source)'
        });
      }
  
      // Validation de la date
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({
          error: 'Date invalide',
          details: 'Le format de la date deadline est invalide'
        });
      }
  
      const VALID_TAGS = [
        'POLITIQUE',
        'ENVIRONNEMENT',
        'DIVERTISSEMENT',
        'ART_CULTURE',
        'SPORT',
        'TECHNOLOGIE',
        'ECONOMIE',
        'SOCIAL',
        'EDUCATION',
        'SANTE'
      ];
  
      // Préparer les données de la question
      const questionData = {
        title,
        description,
        deadline: deadlineDate,
        source,
        organizationId: req.organization.id,
        status: 'active'
      };
  
      // Valider et ajouter les tags si présents
      if (Array.isArray(tags) && tags.length > 0) {
        const validTags = tags.filter(tag => VALID_TAGS.includes(tag));
        if (validTags.length > 0) {
          questionData.tags = validTags;
        }
      }
  
      console.log('Données de la question à créer:', questionData);
  
      // Utiliser une transaction pour créer la question et décrémenter le compteur
      const result = await prisma.$transaction(async (tx) => {
        // Créer la question
        const question = await tx.question.create({
          data: questionData,
          include: {
            organization: true
          }
        });

        // Décrémenter le nombre de questions disponibles
        await tx.organization.update({
          where: { id: req.organization.id },
          data: {
            availableQuestions: {
              decrement: 1
            }
          }
        });

        return question;
      });
  
      console.log('Question créée avec succès:', result);
  
      // Recherche de l'admin et envoi de notification
      const admin = await prisma.user.findFirst({
        where: { isAdmin: true },
        select: { id: true, email: true }
      });
  
      if (admin) {
        try {
          await emailService.sendNewQuestionNotification(
            admin.email,
            {
              ...result,
              organization: req.organization.name
            }
          );
          console.log('✓ Notification envoyée à l\'admin:', admin.email);
        } catch (emailError) {
          console.error('✗ Erreur d\'envoi de notification:', emailError);
        }
      }
  
      res.status(201).json({
        success: true,
        message: 'Question créée avec succès',
        data: result
      });
  
    } catch (error) {
      console.error('Erreur lors de la création de la question:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la création de la question',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
// Route pour obtenir les transactions d'une organisation
router.get('/transactions', authenticateUser, isOrganization, async (req, res) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { userId: req.user.id },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organisation non trouvée' });
    }

    // Récupérer uniquement les transactions de commission pour l'organisation
    const transactions = await prisma.transaction.findMany({
      where: {
        orgId: organization.id,
        type: 'commission', // Ne récupérer que les transactions de type commission
      },
      include: {
        question: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formater les transactions pour l'affichage
    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      createdAt: tx.createdAt,
      questionTitle: tx.question?.title || 'Question inconnue',
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir une organisation par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            bets: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organisation non trouvée' });
    }

    // Calcul des statistiques
    const stats = {
      totalQuestions: organization.questions.length,
      totalRaised: organization.wallet || 0,
      activeQuestions: organization.questions.filter((q) => q.status === 'active').length,
    };

    // Formatage des questions avec leurs totaux
    const formattedQuestions = organization.questions.map((question) => {
      const totalYes = question.bets
        .filter((bet) => bet.prediction === 'yes')
        .reduce((sum, bet) => sum + Number(bet.amount), 0);

      const totalNo = question.bets
        .filter((bet) => bet.prediction === 'no')
        .reduce((sum, bet) => sum + Number(bet.amount), 0);

      const { bets, ...questionData } = question;

      return {
        ...questionData,
        totalYes,
        totalNo,
        organization: organization.name,
        organizationId: organization.id,
      };
    });

    res.json({
      ...organization,
      questions: formattedQuestions,
      stats,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Route publique pour obtenir toutes les organisations approuvées
// backend/routes/organizations.js
// Route publique pour obtenir toutes les organisations approuvées
// backend/routes/organizations.js
router.get('/', async (req, res) => {
    try {
    const organizations = await prisma.organization.findMany({
    where: {
    status: 'approved'
    },
    include: {
    questions: {
    include: {
    bets: true,
    _count: true
    }
    },
    user: {
    select: {
    id: true,
    name: true,
    email: true
    }
    }
    },
    orderBy: {
    createdAt: 'desc'
    }
    });
    console.log('Fetched organizations:', organizations); // Pour le debug

const formattedOrganizations = organizations.map(org => {
  console.log('Formatting org:', org); // Pour le debug
  return {
    id: org.id,
    name: org.name,
    description: org.description,
    category: org.category, // S'assurer que ce champ est inclus
    status: org.status,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    user: org.user,
    wallet: org.wallet || 0,
    questions: org.questions.map(question => {
      const totalYes = question.bets
        .filter(bet => bet.prediction === 'yes')
        .reduce((sum, bet) => sum + Number(bet.amount), 0);

      const totalNo = question.bets
        .filter(bet => bet.prediction === 'no')
        .reduce((sum, bet) => sum + Number(bet.amount), 0);

      return {
        id: question.id,
        title: question.title,
        description: question.description,
        status: question.status,
        totalYes,
        totalNo,
        deadline: question.deadline
      };
    })
  };
});

res.json(formattedOrganizations);

} catch (error) {
    console.error('Error:', error);
    res.status(500).json({
    error: 'Erreur serveur',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    }
    });
    module.exports = router;