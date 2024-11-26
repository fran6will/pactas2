const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const organizationRoutes = require('./routes/organizations');
const transactionRoutes = require('./routes/transactions');
const paymentsRouter = require('./routes/payments');
const authenticateUser = require('./middleware/authenticateUser');
const withdrawalRoutes = require('./routes/withdrawals');
const app = express();
const userRoutes = require('./routes/users');

const prisma = new PrismaClient();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  const httpServer = createServer(app);
const io = new Server(httpServer, {
  // Configuration CORS pour Socket.IO
  cors: {
    origin: ['https://pactas2.onrender.com', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  },
});

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware JSON appliqué à toutes les routes SAUF les webhooks Stripe
app.use((req, res, next) => {
  // Si la requête est pour le webhook, ne pas parser le JSON
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Middleware CORS
app.use(
  cors({
    origin: ['https://pactas2.onrender.com', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Middleware global de logs
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    path: req.path,
    body: req.body,
  });
  next();
});
// Routes API principales
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentsRouter);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);



// Connexion WebSocket
io.on('connection', (socket) => {
  console.log('Nouvelle connexion WebSocket:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Route pour obtenir toutes les questions
app.get('/api/questions', async (req, res) => {
    try {
      const questions = await prisma.question.findMany({
        include: {
          bets: true,
          organization: true,
        },
        where: {
          status: 'active',
          deadline: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      const questionsWithTotals = questions.map((question) => {
        const totalYes = question.bets
          .filter((bet) => bet.prediction === 'yes')
          .reduce((sum, bet) => sum + bet.amount, 0);
  
        const totalNo = question.bets
          .filter((bet) => bet.prediction === 'no')
          .reduce((sum, bet) => sum + bet.amount, 0);
  
        return {
          ...question,
          organization: question.organization.name,
          totalYes,
          totalNo,
          totalPool: totalYes + totalNo,
        };
      });
  
      res.json(questionsWithTotals);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la récupération des questions.' });
    }
  });
  

// Route pour obtenir une question par ID
app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: { bets: true, organization: true },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }

    const totalYes = question.bets.filter(bet => bet.prediction === 'yes')
      .reduce((sum, bet) => sum + bet.amount, 0);
    const totalNo = question.bets.filter(bet => bet.prediction === 'no')
      .reduce((sum, bet) => sum + bet.amount, 0);

    res.json({
      ...question,
      organization: question.organization.name,
      totalYes,
      totalNo,
      totalPool: totalYes + totalNo,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour placer une mise
const validateBet = [
  body('questionId').notEmpty(),
  body('amount').isFloat({ min: 1 }),
  body('prediction').isIn(['yes', 'no']),
];

app.post('/api/bets', authenticateUser, validateBet, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { questionId, amount, prediction } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const question = await prisma.question.findFirst({
        where: { id: questionId, status: 'active', deadline: { gt: new Date() } },
      });

      if (!question) {
        throw new Error('Question non trouvée ou inactive');
      }

      const user = await prisma.user.findUnique({ where: { id: req.user.id } });

      if (!user || user.tokens < amount) {
        throw new Error('Solde insuffisant');
      }

      const bet = await prisma.bet.create({
        data: { userId: req.user.id, questionId, amount, prediction },
      });

      await prisma.user.update({
        where: { id: req.user.id },
        data: { tokens: { decrement: amount } },
      });

      await prisma.transaction.create({
        data: { userId: req.user.id, amount: -amount, type: 'bet', questionId },
      });

      return bet;
    });

    const totals = await prisma.bet.groupBy({
      by: ['prediction'],
      where: { questionId },
      _sum: { amount: true },
    });

    io.emit(`question:${questionId}:update`, totals);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ 
      error: error.message || 'Erreur lors du placement de la mise',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Route pour obtenir les transactions d'un utilisateur
app.get('/api/transactions/:userId', authenticateUser, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur détectée:', err.stack);
  res.status(500).json({
    error: 'Une erreur est survenue',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Démarrage du serveur
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Gestion propre de la fermeture
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});
