// backend/middleware/authenticateAdmin.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Checking admin auth:', { authHeader });

    if (!authHeader) {
      console.log('No auth header present');
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log('Decoded token:', decoded);

    // Vérifier si l'utilisateur existe et est admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        isAdmin: true
      }
    });
    console.log('Found user:', user);

    if (!user || !user.isAdmin) {
      console.log('User not found or not admin');
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    req.user = user;
    console.log('Admin auth successful');
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

module.exports = authenticateAdmin;