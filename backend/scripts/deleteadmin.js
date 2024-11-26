const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUser(userId) {
  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error(`Aucun utilisateur trouvé avec l'ID: ${userId}`);
      return;
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`Utilisateur supprimé avec succès : ${userId}`);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', error.message);
  } finally {
    // Fermer la connexion à Prisma
    await prisma.$disconnect();
  }
}

// Remplacez l'ID ci-dessous par l'ID de l'utilisateur à supprimer
deleteUser('81d9709d-06e6-40a9-8e59-79717d9a107e');
//b911568f-bd92-4652-ae14-813e8fc84667