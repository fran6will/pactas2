const express = require('express');
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const authenticateUser = require('../middleware/authenticateUser');

const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Route pour gérer la redirection success
router.get('/success', async (req, res) => {
  const sessionId = req.query.session_id;

  if (!sessionId) {
    console.error('Session ID missing');
    return res.redirect(`${process.env.FRONTEND_URL}/error`);
  }

  try {
    // Récupérer la session Stripe pour afficher les détails pertinents
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      console.error('Session not found:', sessionId);
      return res.redirect(`${process.env.FRONTEND_URL}/error`);
    }

    // Rediriger vers une page commune avec les métadonnées incluses
    res.redirect(
      `${process.env.FRONTEND_URL}/success?session_id=${sessionId}&type=${session.metadata?.type || 'unknown'}`
    );
  } catch (error) {
    console.error('Error retrieving session:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}/error`);
  }
});

// Route pour créer une session de paiement pour un pack
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
      return res.status(400).json({ error: 'Invalid pack' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: `Pack ${pack.questions} question${pack.questions > 1 ? 's' : ''}`
          },
          unit_amount: pack.price * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: req.user.id,
      metadata: {
        type: 'question_pack',
        packId,
        questions: pack.questions.toString()
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating session:', error.message);
    res.status(500).json({ error: 'Error creating Stripe session' });
  }
});

// Route pour créer une session de paiement pour les tokens
router.post('/create-payment-session', authenticateUser, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Token Recharge',
            description: `Purchase of ${amount} tokens`
          },
          unit_amount: amount * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: req.user.id,
      metadata: {
        type: 'token_purchase',
        amount
      }
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating session:', error.message);
    res.status(500).json({ error: 'Error creating payment session' });
  }
});

router.get('/api/payments/verify-session', async (req, res) => {
  const sessionId = req.query.session_id;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    // Récupérer la session depuis Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

    res.status(200).json({
      session,
      paymentIntent,
      message: 'Payment verified successfully!',
    });
  } catch (error) {
    console.error('Error verifying session:', error.message);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});



// Route Webhook pour gérer les événements Stripe
router.post('/webhook', async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.metadata?.type === 'question_pack') {
        // Traitement pour les packs
      } else if (session.metadata?.type === 'token_purchase') {
        // Traitement pour les tokens
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Fonction pour mettre à jour les tokens de l'utilisateur
async function updateUserTokens(session) {
  const userId = session.client_reference_id;
  const amount = session.amount_total / 100;

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: userId },
        data: { tokens: { increment: amount } }
      });

      await prisma.transaction.create({
        data: {
          amount,
          type: 'deposit',
          user: { connect: { id: userId } }
        }
      });
    });
  } catch (error) {
    console.error('Error updating user tokens:', error.message);
    throw error;
  }
}

module.exports = router;
