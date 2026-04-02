/*
  Warnings:

  - You are about to drop the column `userId` on the `Theme` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Theme" DROP CONSTRAINT "Theme_userId_fkey";

-- DropIndex
DROP INDEX "Theme_userId_key";

-- AlterTable
ALTER TABLE "Theme" DROP COLUMN "userId";
