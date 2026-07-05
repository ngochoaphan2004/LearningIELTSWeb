/*
  Warnings:

  - You are about to drop the column `weeknumber` on the `StudySession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudySession" DROP COLUMN "weeknumber",
ADD COLUMN     "week_number" INTEGER;
