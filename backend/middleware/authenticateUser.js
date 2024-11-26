// middleware/authenticateUser.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateUser = (req, res, next) => {
  try {
    console.log('Checking authentication...');
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader) {
      console.log('No auth header found');
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log('Decoded token:', decoded);

    // Ajouter l'utilisateur décodé à la requête
    req.user = decoded;
    console.log('User set in request:', req.user);

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

module.exports = authenticateUser;