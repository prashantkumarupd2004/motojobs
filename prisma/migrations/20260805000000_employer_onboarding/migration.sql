-- Employer onboarding, interviews and saved candidates.

-- Company: onboarding progress, hiring preferences and the extra identity
-- fields the employer wizard collects.
ALTER TABLE "companies"
  ADD COLUMN "panNumber" TEXT,
  ADD COLUMN "mapsUrl" TEXT,
  ADD COLUMN "hiringCategories" TEXT,
  ADD COLUMN "hiringFrequency" TEXT,
  ADD COLUMN "hrName" TEXT,
  ADD COLUMN "hrPhone" TEXT,
  ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "profileCompletion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "facebookUrl" TEXT,
  ADD COLUMN "instagramUrl" TEXT,
  ADD COLUMN "youtubeUrl" TEXT;

-- Companies that already finished their profile before this migration keep a
-- truthful completion figure instead of showing 0% on the new dashboard card.
UPDATE "companies"
SET "profileCompletion" = 100, "onboardingStep" = 3
WHERE "isProfileComplete" = true;

-- Job: split location, plus the benefits and joining fields the spec adds.
ALTER TABLE "jobs"
  ADD COLUMN "state" TEXT,
  ADD COLUMN "city" TEXT,
  ADD COLUMN "benefits" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "joiningTimeline" TEXT;

CREATE INDEX "jobs_recruiterId_status_idx" ON "jobs"("recruiterId", "status");

-- WORK_MODES became Onsite/Hybrid/Remote. Rows written under the old vocabulary
-- would otherwise fall outside every filter the UI offers.
UPDATE "jobs" SET "workMode" = 'Onsite' WHERE "workMode" IN ('On-site', 'Field');

CREATE TABLE "saved_candidates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "notes" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_candidates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saved_candidates_companyId_candidateId_key"
  ON "saved_candidates"("companyId", "candidateId");
CREATE INDEX "saved_candidates_companyId_savedAt_idx"
  ON "saved_candidates"("companyId", "savedAt");

ALTER TABLE "saved_candidates"
  ADD CONSTRAINT "saved_candidates_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_candidates"
  ADD CONSTRAINT "saved_candidates_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "candidates"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMins" INTEGER NOT NULL DEFAULT 30,
    "mode" TEXT NOT NULL DEFAULT 'IN_PERSON',
    "venue" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "outcome" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "interviews_companyId_status_scheduledAt_idx"
  ON "interviews"("companyId", "status", "scheduledAt");
CREATE INDEX "interviews_applicationId_idx" ON "interviews"("applicationId");

ALTER TABLE "interviews"
  ADD CONSTRAINT "interviews_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "applications"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interviews"
  ADD CONSTRAINT "interviews_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interviews"
  ADD CONSTRAINT "interviews_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "jobs"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
