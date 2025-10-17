-- AlterTable
ALTER TABLE "spotify_activities" ADD COLUMN     "genres" TEXT[] DEFAULT ARRAY[]::TEXT[];
