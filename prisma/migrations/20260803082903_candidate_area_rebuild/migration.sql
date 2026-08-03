/*
  Warnings:

  - You are about to drop the `assessment_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assessments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job_alerts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "assessment_results" DROP CONSTRAINT "assessment_results_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "assessment_results" DROP CONSTRAINT "assessment_results_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "job_alerts" DROP CONSTRAINT "job_alerts_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "job_alerts" DROP CONSTRAINT "job_alerts_jobId_fkey";

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "jobTitles" TEXT;

-- DropTable
DROP TABLE "assessment_results";

-- DropTable
DROP TABLE "assessments";

-- DropTable
DROP TABLE "job_alerts";

-- CreateTable
CREATE TABLE "profile_views" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "recruiterId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_views_candidateId_viewedAt_idx" ON "profile_views"("candidateId", "viewedAt");

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
