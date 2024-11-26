const axios = require('axios');

async function testBet() {
  try {
    // Étape 1 : Login
    const loginResponse = await axios.post('https://pactas2.onrender.com/api/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login réussi, token reçu:', token);
    console.log('Utilisateur connecté:', loginResponse.data.user);

    // Étape 2 : Placer une mise
    const betResponse = await axios.post(
      'https://pactas2.onrender.com/api/bets',
      {
        questionId: "850f3759-d34d-4225-a724-13f647666218", // Remplacez par un ID valide
        amount: 100,
        prediction: "yes"
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Mise placée avec succès:', betResponse.data);

    // Étape 3 : Vérifier le solde
    const userResponse = await axios.get('https://pactas2.onrender.com/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Nouveau solde:', userResponse.data.tokens);

  } catch (error) {
    console.error('Erreur rencontrée :', error.response?.data || error.message);
  }
}

testBet();
