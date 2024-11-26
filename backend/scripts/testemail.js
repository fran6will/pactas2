const { emailService } = require('../services/email.service');

(async () => {
  try {
    await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      template: 'organization-approved',
      data: {
        organizationName: 'Test Organization',
        loginUrl: 'https://pactas2.onrender.com/auth',
      },
    });
    console.log('Email envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
})();
