-- CreateEnum
CREATE TYPE "QuestionTag" AS ENUM ('POLITIQUE', 'ENVIRONNEMENT', 'DIVERTISSEMENT', 'ART_CULTURE', 'SPORT', 'TECHNOLOGIE', 'ECONOMIE', 'SOCIAL', 'EDUCATION', 'SANTE');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "tags" "QuestionTag"[];
