-- CreateEnum
CREATE TYPE "OrganizationCategory" AS ENUM ('EDUCATION', 'SANTE', 'ENVIRONNEMENT', 'CULTURE', 'SPORT', 'SOCIAL', 'TECHNOLOGIE', 'HUMANITAIRE', 'COMMUNAUTAIRE', 'RECHERCHE');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "category" "OrganizationCategory";
