/*
  Warnings:

  - The values [LIVE_STREAMING] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `LiveStreams` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('FRIEND_REQUEST_RECEIVED', 'FRIEND_REQUEST_ACCEPTED', 'POST_LIKED', 'POST_COMMENTED');
ALTER TABLE "Notification" ALTER COLUMN "notificationType" TYPE "NotificationType_new" USING ("notificationType"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "LiveStreams" DROP CONSTRAINT "LiveStreams_userId_fkey";

-- DropTable
DROP TABLE "LiveStreams";

-- CreateTable
CREATE TABLE "Story" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
