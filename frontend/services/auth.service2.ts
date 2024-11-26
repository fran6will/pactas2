const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

const authService = {
  login: async (email, password, type) => {
    // Determine the model based on login type
    const model = type === 'organization' ? prisma.organization : prisma.user;
    const account = await model.findUnique({ where: { email } });

    if (!account) {
      throw new Error('Compte non trouvé.');
    }

    // For organizations, ensure account is approved
    if (type === 'organization' && account.status !== 'approved') {
      throw new Error('Votre compte est en attente d\'approbation.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      throw new Error('Mot de passe incorrect.');
    }

    // Generate JWT token
    const tokenPayload = { id: account.id, email: account.email, type };
    const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });

    // Construct response
    return {
      token,
      account: {
        id: account.id,
        email: account.email,
        name: account.name || account.organizationName,
        tokens: account.tokens || null,
        isAdmin: account.isAdmin || false,
      },
    };
  },

  getAuthenticatedUser: async (id, type) => {
    const model = type === 'organization' ? prisma.organization : prisma.user;

    const userData = await model.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        organizationName: true,
        tokens: true,
        isAdmin: true,
      },
    });

    if (!userData) {
      throw new Error('Compte non trouvé.');
    }

    return userData;
  },

  registerUser: async (email, password, name) => {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé.');
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        tokens: 1000, // Initial tokens for new users
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, type: 'user' },
      SECRET_KEY,
      { expiresIn: '1h' },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tokens: user.tokens,
      },
    };
  },
};

module.exports = { authService };
