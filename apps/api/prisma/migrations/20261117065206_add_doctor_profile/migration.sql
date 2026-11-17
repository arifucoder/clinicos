-- CreateTable
CREATE TABLE "doctor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "consultationFeeCents" INTEGER NOT NULL,
    "roomNumber" TEXT,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "slotMinutesDefault" INTEGER NOT NULL DEFAULT 15,
    "bio" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_userId_key" ON "doctor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_licenseNumber_key" ON "doctor_profiles"("licenseNumber");

-- CreateIndex
CREATE INDEX "doctor_profiles_specialtyId_idx" ON "doctor_profiles"("specialtyId");

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
