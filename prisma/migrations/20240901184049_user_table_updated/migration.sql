/*
  Warnings:

  - The `verification_token` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verification_token",
ADD COLUMN     "verification_token" INTEGER;
