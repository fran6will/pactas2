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
        success_url: `${process.env.FRONTEND_URL}/pack-success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        client_reference_id: req.user.id, // ID de l'utilisateur
        metadata: {
          type: 'question_pack',
          packId,
          questions: pack.questions.toString(),
          organizationId: req.user.organization?.id 

        }
      });
  
      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error('Error creating session:', err);
      console.log('Session metadata:', session.metadata);

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
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL); 
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide.' });
    }

    // Vérifiez que FRONTEND_URL est défini
    if (!process.env.FRONTEND_URL) {
      console.error('FRONTEND_URL is not defined in environment variables');
      return res.status(500).json({ error: 'Configuration error' });
    }

    // Construction des URLs avec vérification
    const successUrl = new URL('/success', process.env.FRONTEND_URL);
    const cancelUrl = new URL('/cancel', process.env.FRONTEND_URL);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Recharge de Tokens',
              description: `Achat de ${amount} tokens`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl.toString()}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl.toString(),
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
        amount: amount,
        type: 'token_purchase'
      }
    });

    console.log('Success URL:', session.success_url);
    console.log('Cancel URL:', session.cancel_url);
    console.log('Payment session created:', session.id);
    
    res.status(200).json({ 
      url: session.url,
      sessionId: session.id
    });
  } catch (err) {
    console.error('Error creating payment session:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la session Stripe.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Ajoutez aussi une route pour vérifier l'état de la session
router.get('/check-session/:sessionId', authenticateUser, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({ status: session.status });
  } catch (err) {
    console.error('Error checking session:', err);
    res.status(500).json({ error: 'Erreur lors de la vérification de la session' });
  }
});

// backend/routes/payments.js

router.post('/webhook', async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET.trim();

  try {
    console.log('Webhook Processing:', {
      sigExists: !!sig,
      payloadExists: !!payload,
      secretLength: endpointSecret.length
    });

    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      endpointSecret
    );

    console.log('Webhook event constructed successfully:', event.type)

      if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          
          console.log('Processing completed session:', {
              metadata: session.metadata,
              clientReferenceId: session.client_reference_id
          });

          // Gestion des packs de questions
          if (session.metadata?.type === 'question_pack') {
              try {
                  const user = await prisma.user.findUnique({
                      where: { id: session.client_reference_id },
                      include: { organization: true }
                  });

                  if (!user) {
                      throw new Error(`User not found: ${session.client_reference_id}`);
                  }

                  let organizationId = user.organization?.id;
                  if (!organizationId) {
                      const newOrg = await prisma.organization.create({
                          data: {
                              userId: user.id,
                              availableQuestions: 0,
                              totalQuestionsPurchased: 0
                          }
                      });
                      organizationId = newOrg.id;
                  }

                  const questionsToAdd = parseInt(session.metadata.questions);
                  await prisma.$transaction([
                      prisma.organization.update({
                          where: { id: organizationId },
                          data: {
                              availableQuestions: { increment: questionsToAdd },
                              totalQuestionsPurchased: { increment: questionsToAdd }
                          }
                      }),
                      prisma.transaction.create({
                          data: {
                              amount: session.amount_total / 100,
                              type: 'question_pack_purchase',
                              orgId: organizationId
                          }
                      })
                  ]);
              } catch (error) {
                  console.error('Error processing question pack:', error);
              }
          }
          // Gestion des achats de tokens
          else if (session.metadata?.type === 'token_purchase') {
              try {
                  await updateUserTokens(session);
              } catch (error) {
                  console.error('Error processing token purchase:', error);
              }
          }
      }

      res.json({ received: true, type: event.type });
      
    } catch (err) {
      console.error('Webhook error details:', {
        error: err.message,
        sigHeader: sig?.substring(0, 20) + '...',
        secretPrefix: endpointSecret?.substring(0, 5) + '...'
      });
      
      return res.status(400).send(`Webhook Error: ${err.message}`);
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