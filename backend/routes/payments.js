const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const authenticateUser = require('../middleware/authenticateUser');

const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.get('/success', (req, res) => {
  const sessionId = req.query.session_id;
  const purchaseType = req.query.type;

  if (!sessionId) {
    return res.redirect(`${process.env.FRONTEND_URL}/error`);
  }

  let successUrl;
  if (purchaseType === 'pack') {
    successUrl = `${process.env.FRONTEND_URL}/pack-success?session_id=${sessionId}`;
  } else {
    successUrl = `${process.env.FRONTEND_URL}/token-success?session_id=${sessionId}`;
  }

  res.redirect(successUrl);
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
      pack3: { price: 45, questions: 5 },
    };

    const pack = packOptions[packId];
    if (!pack) {
      return res.status(400).json({ error: 'Invalid pack.' });
    }

    // For token purchases
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'cad',
      product_data: { name: 'Token Recharge' },
      unit_amount: amount * 100,
    },
    quantity: 1,
  }],
  mode: 'payment',
  // The correct format for success URL with session ID
  success_url: `${process.env.FRONTEND_URL}/token-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL}/cancel`,
  client_reference_id: req.user.id,
  metadata: {
    type: 'token_purchase',
    amount: amount.toString(),
  },
});

// Route pour créer une session de paiement pour des tokens
router.post('/create-payment-session', authenticateUser, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Token Recharge',
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/api/payments/success?session_id={CHECKOUT_SESSION_ID}&type=token`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: req.user.id,
      metadata: {
        type: 'token_purchase',
        amount: amount.toString(),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Error creating payment session:', err);
    res.status(500).json({ error: 'Failed to create payment session.' });
  }
});

// Route Webhook pour gérer les événements Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    // Utilisation du corps brut pour Stripe
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Gestion des événements Stripe
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('Webhook received for session:', session.id, 'Type:', session.metadata?.type);

      if (session.metadata?.type === 'question_pack') {
        await handleQuestionPackPurchase(session);
      } else if (session.metadata?.type === 'token_purchase') {
        await handleTokenPurchase(session);
      } else {
        console.warn('Unhandled metadata type:', session.metadata?.type);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});


// Fonction pour gérer les achats de packs de questions
async function handleQuestionPackPurchase(session) {
  const user = await prisma.user.findUnique({
    where: { id: session.client_reference_id },
    include: { organization: true },
  });

  if (!user?.organization?.id) {
    throw new Error(`Organization not found for user: ${session.client_reference_id}`);
  }

  const organizationId = user.organization.id;
  const questionsToAdd = parseInt(session.metadata.questions, 10);

  await prisma.$transaction(async (tx) => {
    await tx.organization.update({
      where: { id: organizationId },
      data: {
        availableQuestions: { increment: questionsToAdd },
        totalQuestionsPurchased: { increment: questionsToAdd },
      },
    });

    await tx.transaction.create({
      data: {
        amount: session.amount_total / 100,
        type: 'question_pack_purchase',
        orgId: organizationId,
      },
    });
  });

  console.log('Processed question pack purchase for organization:', organizationId);
}

// Fonction pour gérer les achats de tokens
async function handleTokenPurchase(session) {
  const userId = session.client_reference_id;
  const tokensToAdd = session.amount_total / 100;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { tokens: { increment: tokensToAdd } },
    });

    await tx.transaction.create({
      data: {
        amount: tokensToAdd,
        type: 'deposit',
        userId: userId,
      },
    });
  });

  console.log('Processed token purchase for user:', userId);
}

module.exports = router;
