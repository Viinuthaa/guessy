-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "yesPrice" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "noPrice" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);
