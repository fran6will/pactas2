// backend/services/email.service.js
require('dotenv').config(); // Assurez-vous d'avoir configuré dotenv
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS);

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

// Configuration du transporteur avec debug
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true, // Active les logs détaillés
  logger: true // Active le logger
});


// Vérification de la configuration au démarrage
transporter.verify(function(error, success) {
  if (error) {
    console.error('Erreur de configuration SMTP:', error);
  } else {
    console.log('Configuration SMTP vérifiée avec succès');
  }
});

// Cache pour les templates
const templateCache = new Map();

async function getTemplate(templateName) {
  console.log(`Chargement du template: ${templateName}`);
  
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }

  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
  try {
    console.log(`Lecture du fichier template: ${templatePath}`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    templateCache.set(templateName, template);
    return template;
  } catch (error) {
    console.error(`Erreur lors du chargement du template ${templateName}:`, error);
    throw error;
  }
}

const emailService = {
  async sendEmail({ to, subject, template, data }) {
    console.log('Préparation de l\'envoi d\'email:', {
      to,
      subject,
      template,
      data: JSON.stringify(data, null, 2)
    });

    try {
      const compiledTemplate = await getTemplate(template);
      const html = compiledTemplate(data);

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject,
        html
      };

      console.log('Options d\'email configurées:', mailOptions);

      const info = await transporter.sendMail(mailOptions);
      console.log('Email envoyé avec succès:', {
        messageId: info.messageId,
        response: info.response,
        envelope: info.envelope
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', {
        error: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  },

  async sendNewQuestionNotification(adminEmail, question) {
    console.log('Envoi de notification de nouvelle question à:', adminEmail);
    console.log('Données de la question:', question);

    try {
      await this.sendEmail({
        to: adminEmail,
        subject: 'Nouvelle question créée sur PredictSocial',
        template: 'new-question-notification',
        data: {
          questionTitle: question.title,
          organizationName: question.organization?.name || 'Organisation inconnue',
          adminDashboardUrl: `${process.env.FRONTEND_URL}/admin/questions`
        }
      });
      console.log('✓ Notification envoyée avec succès');
    } catch (error) {
      console.error('✗ Échec de l\'envoi de la notification:', error);
      throw error;
    }
  }
};
module.exports = { emailService };
