const express = require('express');
const router = express.Router();
const withdrawalService = require('../services/withdrawal.service');
const authenticateUser = require('../middleware/authenticateUser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware pour vérifier si l'utilisateur est une organisation
const isOrganization = async (req, res, next) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { userId: req.user.id }
    });

    if (!organization) {
      return res.status(403).json({ error: 'Accès réservé aux organisations' });
    }

    req.organization = organization;
    next();
  } catch (error) {
    console.error('Erreur dans le middleware isOrganization:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Route pour demander un retrait
router.post('/request', authenticateUser, isOrganization, async (req, res) => {
  try {
    const { amount } = req.body;

    // Validation du montant
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    // Appel au service de retrait
    const withdrawal = await withdrawalService.requestWithdrawal(
      req.organization.id,
      amount
    );

    res.json(withdrawal);
  } catch (error) {
    console.error('Erreur lors de la demande de retrait:', error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour l'historique des retraits
router.get('/history', authenticateUser, async (req, res) => {
  try {
    // Récupération de l'utilisateur et de son organisation
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { organization: true }
    });

    if (!user || !user.organization) {
      return res.status(400).json({ error: 'Utilisateur ou organisation invalide' });
    }

    // Récupération de l'historique des retraits
    const organizationId = user.organization.id;
    const withdrawals = await prisma.withdrawal.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(withdrawals);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des retraits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
