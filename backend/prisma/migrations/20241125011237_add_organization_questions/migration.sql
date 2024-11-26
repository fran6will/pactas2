-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "availableQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalQuestionsPurchased" INTEGER NOT NULL DEFAULT 0;
