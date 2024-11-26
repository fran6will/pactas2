const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const withdrawalService = {
  async requestWithdrawal(organizationId, amount) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new Error('Organisation non trouvée');
    }

    if (organization.wallet < amount) {
      throw new Error('Solde insuffisant');
    }

    // Pour le MVP : Créer simplement une "demande de retrait" en base
    const withdrawal = await prisma.withdrawal.create({
      data: {
        organizationId,
        amount,
        status: 'pending'
      }
    });

    // Mettre à jour le solde de l'organisation
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        wallet: {
          decrement: amount
        }
      }
    });

    // Créer une transaction pour tracer le retrait
    await prisma.transaction.create({
      data: {
        organizationId: organizationId, // Correct
        amount: -amount,
        type: 'withdrawal',
        status: 'pending'
      }
    });
    

    // Pour le MVP : Envoyer un email à l'admin
    const emailService = require('./email.service');
    await emailService.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Nouvelle demande de retrait',
      template: 'admin-withdrawal-request',
      data: {
        organizationName: organization.name,
        amount,
        withdrawalId: withdrawal.id
      }
    });

    return withdrawal;
  },

  // Nouvelle méthode pour récupérer l'historique des retraits
  async getWithdrawalHistory(organizationId) {
    return prisma.withdrawal.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
  }
};

module.exports = withdrawalService;
