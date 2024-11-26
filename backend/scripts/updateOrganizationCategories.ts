import { PrismaClient, OrganizationCategory } from '@prisma/client'

const prisma = new PrismaClient()

// Les catégories par mot-clé dans les descriptions
const CATEGORY_KEYWORDS = {
  [OrganizationCategory.EDUCATION]: ['education', 'école', 'enseignement', 'formation', 'apprentissage'],
  [OrganizationCategory.SANTE]: ['santé', 'médical', 'bien-être', 'médecine', 'soin'],
  [OrganizationCategory.ENVIRONNEMENT]: ['environnement', 'écologie', 'climat', 'durable', 'vert'],
  [OrganizationCategory.CULTURE]: ['culture', 'art', 'musique', 'théâtre', 'cinéma'],
  [OrganizationCategory.SPORT]: ['sport', 'athlète', 'compétition', 'équipe', 'jeu'],
  [OrganizationCategory.SOCIAL]: ['social', 'solidarité', 'entraide', 'communauté', 'aide'],
  [OrganizationCategory.TECHNOLOGIE]: ['technologie', 'innovation', 'numérique', 'tech', 'digital'],
  [OrganizationCategory.HUMANITAIRE]: ['humanitaire', 'urgence', 'aide', 'secours', 'donation'],
  [OrganizationCategory.COMMUNAUTAIRE]: ['communauté', 'local', 'quartier', 'voisinage', 'collectif'],
  [OrganizationCategory.RECHERCHE]: ['recherche', 'science', 'étude', 'développement', 'innovation']
}

// Détermine la catégorie en fonction de la description
function determineCategory(description: string): OrganizationCategory {
  const lowerDescription = description.toLowerCase()
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerDescription.includes(keyword))) {
      return category as OrganizationCategory
    }
  }
  
  return OrganizationCategory.SOCIAL // Catégorie par défaut
}

async function updateOrganizationCategories() {
  try {
    console.log('Starting organizations categories update...')

    // Récupérer toutes les organisations sans catégorie
    const organizations = await prisma.organization.findMany({
      where: {
        category: null
      }
    })

    console.log(`Found ${organizations.length} organizations without category`)

    // Mettre à jour chaque organisation
    for (const org of organizations) {
      const category = determineCategory(org.description)
      
      await prisma.organization.update({
        where: { id: org.id },
        data: { category }
      })

      console.log(`Updated ${org.name} with category ${category}`)
    }

    console.log('Categories update completed successfully')

  } catch (error) {
    console.error('Error while updating categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
updateOrganizationCategories();