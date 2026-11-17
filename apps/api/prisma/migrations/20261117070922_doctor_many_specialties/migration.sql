/*
  Warnings:

  - You are about to drop the column `specialtyId` on the `doctor_profiles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "doctor_profiles" DROP CONSTRAINT "doctor_profiles_specialtyId_fkey";

-- DropIndex
DROP INDEX "doctor_profiles_specialtyId_idx";

-- AlterTable
ALTER TABLE "doctor_profiles" DROP COLUMN "specialtyId";

-- CreateTable
CREATE TABLE "doctor_specialties" (
    "doctorProfileId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_specialties_pkey" PRIMARY KEY ("doctorProfileId","specialtyId")
);

-- CreateIndex
CREATE INDEX "doctor_specialties_specialtyId_idx" ON "doctor_specialties"("specialtyId");

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
