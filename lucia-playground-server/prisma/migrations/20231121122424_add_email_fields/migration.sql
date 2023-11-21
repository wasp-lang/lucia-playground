-- AlterTable
ALTER TABLE "Auth" ADD COLUMN     "emailVerificationSentAt" TIMESTAMP(3),
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordResetSentAt" TIMESTAMP(3);
