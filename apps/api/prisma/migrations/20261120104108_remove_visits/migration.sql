/*
  Warnings:

  - You are about to drop the `visits` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_checkedInById_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_patientId_fkey";

-- DropTable
DROP TABLE "visits";

-- DropEnum
DROP TYPE "VisitStatus";
