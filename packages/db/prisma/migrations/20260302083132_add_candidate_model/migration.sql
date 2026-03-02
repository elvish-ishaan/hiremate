-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "linkedIn" TEXT,
    "coverLetter" TEXT,
    "resumeUrl" TEXT NOT NULL,
    "resumeText" TEXT NOT NULL,
    "interviewToken" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_interviewToken_key" ON "Candidate"("interviewToken");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
