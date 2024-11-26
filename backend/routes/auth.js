require('dotenv').config(); // Assurez-vous d'avoir configuré dotenv

// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateUser = require('../middleware/authenticateUser'); // Assurez-vous que ce middleware est défini

const prisma = new PrismaClient();

// Route d'inscription
router.post('/register', async (req, res) => {
  console.log('Register request received:', req.body);

  try {
    const { email, password, name, userType, description } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur et l'organisation dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          userType: userType === 'organization' ? 'organization' : 'user',
          tokens: 0
        }
      });

      let organization = null;
      // 2. Si c'est une organisation, créer l'entrée correspondante
      if (userType === 'organization') {
        organization = await tx.organization.create({
          data: {
            name,
            description: description || '',
            user: {
              connect: { id: user.id }
            },
            status: 'pending'
          }
        });

        // 3. Récupérer l'utilisateur avec ses relations
        const userWithOrg = await tx.user.findUnique({
          where: { id: user.id },
          include: {
            organization: true
          }
        });

        return { ...userWithOrg, organization };
      }

      return user;
    });

    console.log('Registration result:', result);

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: result.id,
        email: result.email,
        userType: result.userType,
        isAdmin: result.isAdmin
      },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Envoyer la réponse
    res.status(201).json({
      token,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        tokens: result.tokens,
        userType: result.userType,
        isAdmin: result.isAdmin,
        organization: userType === 'organization' ? result.organization : undefined
      }
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'inscription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  console.log('Login request received');
  
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Vérifier le statut de l'organisation si c'est une organisation
    if (user.userType === 'organization' && user.organization) {
      if (user.organization.status === 'pending') {
        // On permet la connexion mais on indique le statut pending
        console.log('Organization is pending approval');
      } else if (user.organization.status === 'rejected') {
        return res.status(403).json({ error: 'Votre demande d\'organisation a été rejetée' });
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        userType: user.userType,
        isAdmin: user.isAdmin
      },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tokens: user.tokens,
        userType: user.userType,
        isAdmin: user.isAdmin,
        organization: user.organization
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Nouvelle route : Obtenir les informations de l'utilisateur connecté
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organization: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Ne pas envoyer le mot de passe
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
