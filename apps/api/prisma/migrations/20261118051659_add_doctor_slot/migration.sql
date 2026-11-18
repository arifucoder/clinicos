-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('OPEN', 'BLOCKED');

-- CreateTable
CREATE TABLE "doctor_slots" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'OPEN',
    "blockReason" TEXT,
    "blockedAt" TIMESTAMP(3),
    "blockedById" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doctor_slots_status_startAt_idx" ON "doctor_slots"("status", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_slots_doctorId_startAt_key" ON "doctor_slots"("doctorId", "startAt");

-- AddForeignKey
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
