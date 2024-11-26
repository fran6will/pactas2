// backend/routes/payments.js
const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const authenticateUser = require('../middleware/authenticateUser');

const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
// backend/routes/payments.js
router.get('/success', (req, res) => {
  console.log('Redirecting to:', `${process.env.FRONTEND_URL}/success`);
  res.redirect(`${process.env.FRONTEND_URL}/success`);
});

router.get('/cancel', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/cancel`);
});
router.post('/create-pack-payment-session', authenticateUser, async (req, res) => {
    try {
      const { packId } = req.body;
  
      if (!req.user?.id) {
        return res.status(400).json({ error: 'User not found' });
      }
  
      const packOptions = {
        pack1: { price: 10, questions: 1 },
        pack2: { price: 18, questions: 3 },
        pack3: { price: 45, questions: 5 }
      };
  
      const pack = packOptions[packId];
      if (!pack) {
        return res.status(400).json({ error: 'Pack invalide.' });
      }
  
      console.log('Creating session for:', {
        userId: req.user.id,
        packId,
        questions: pack.questions
      });
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'cad',
            product_data: {
              name: `Pack ${pack.questions} question${pack.questions > 1 ? 's' : ''}`,
            },
            unit_amount: pack.price * 100,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        client_reference_id: req.user.id, // ID de l'utilisateur
        metadata: {
          type: 'question_pack',
          packId,
          questions: pack.questions.toString()
        }
      });
  
      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error('Error creating session:', err);
      res.status(500).json({ error: 'Erreur lors de la création de la session.' });
    }
  });

  router.get('/organization-questions', authenticateUser, async (req, res) => {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id: req.user.organization?.id },
        select: {
          availableQuestions: true,
          totalQuestionsPurchased: true
        }
      });
      
      res.json(organization);
    } catch (error) {
      console.error('Error fetching organization questions:', error);
      res.status(500).json({ error: 'Error fetching organization data' });
    }
  });


// Route pour créer une session de paiement





router.post('/create-payment-session', authenticateUser, async (req, res) => {
  try {
    console.log('Creating payment session for:', req.user.id);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Recharge de Tokens',
            },
            unit_amount: amount * 100, // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,

      client_reference_id: req.user.id, // Pour identifier l'utilisateur
    });

    console.log('Payment session created:', session.id);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Error creating payment session:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la session Stripe.' });
  }
});

// backend/routes/payments.js

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
  
      console.log('Webhook received:', event.type);
  
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        console.log('Session complete:', {
          metadata: session.metadata,
          organizationId: session.metadata?.organizationId
        });
  
        if (session.metadata?.type === 'question_pack') {
          try {
            // Vérifier que l'organisation existe et récupérer son ID
            const user = await prisma.user.findUnique({
              where: { id: session.client_reference_id },
              include: {
                organization: true
              }
            });
  
            if (!user?.organization?.id) {
              console.error('Organization not found for user:', session.client_reference_id);
              return res.status(400).json({ error: 'Organization not found' });
            }
  
            const organizationId = user.organization.id;
            const questionsToAdd = parseInt(session.metadata.questions);
  
            console.log('Updating organization:', {
              organizationId,
              questionsToAdd
            });
  
            const result = await prisma.$transaction(async (tx) => {
                // Mettre à jour l'organisation
                const updatedOrg = await tx.organization.update({
                  where: { 
                    id: organizationId
                  },
                  data: {
                    availableQuestions: {
                      increment: questionsToAdd
                    },
                    totalQuestionsPurchased: {
                      increment: questionsToAdd
                    }
                  }
                });
              
                // Créer la transaction avec le bon champ orgId
                const transaction = await tx.transaction.create({
                  data: {
                    amount: session.amount_total / 100,
                    type: 'question_pack_purchase',
                    orgId: organizationId,  // Utiliser orgId directement
                    // pas besoin de metadata car ce n'est pas dans votre modèle
                  }
                });
              
                return { updatedOrg, transaction };
              });
  
            console.log('Update successful:', result);
          } catch (error) {
            console.error('Error processing question pack purchase:', error);
          }
        }
      }
  
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });
// Fonction pour mettre à jour les tokens de l'utilisateur
async function updateUserTokens(session) {
  const userId = session.client_reference_id;
  const amount = session.amount_total / 100; // Convertir les centimes en euros

  console.log('Updating tokens for user:', userId, 'Amount:', amount);

  try {
    // Effectuer les deux opérations dans une transaction
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Mettre à jour les tokens de l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          tokens: { increment: amount }
        }
      });

      // 2. Créer la transaction
      const transaction = await prisma.transaction.create({
        data: {
          amount: amount,
          type: 'deposit',
          user: {
            connect: {
              id: userId
            }
          }
        }
      });

      return { updatedUser, transaction };
    });

    console.log('Transaction completed successfully:', {
      userId,
      newBalance: result.updatedUser.tokens,
      transactionId: result.transaction.id
    });

    return result;
  } catch (err) {
    console.error('Error in updateUserTokens:', err);
    throw err;
  }
}

module.exports = router;