-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "currentState" TEXT,
ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "jobCategories" TEXT,
ADD COLUMN     "panCardUrl" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "preferredBrand" TEXT,
ADD COLUMN     "preferredCity" TEXT,
ADD COLUMN     "preferredRole" TEXT,
ADD COLUMN     "preferredState" TEXT,
ADD COLUMN     "profileStep" INTEGER NOT NULL DEFAULT 0;
