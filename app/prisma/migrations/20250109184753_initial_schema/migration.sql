/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GamingActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtherActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Presence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpotifyActivity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_presenceId_fkey";

-- DropForeignKey
ALTER TABLE "GamingActivity" DROP CONSTRAINT "GamingActivity_activityId_fkey";

-- DropForeignKey
ALTER TABLE "OtherActivity" DROP CONSTRAINT "OtherActivity_activityId_fkey";

-- DropForeignKey
ALTER TABLE "SpotifyActivity" DROP CONSTRAINT "SpotifyActivity_activityId_fkey";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "GamingActivity";

-- DropTable
DROP TABLE "OtherActivity";

-- DropTable
DROP TABLE "Presence";

-- DropTable
DROP TABLE "SpotifyActivity";

-- CreateTable
CREATE TABLE "presences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" TEXT,

    CONSTRAINT "presences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "presence_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "session_start" TIMESTAMP(3),
    "session_end" TIMESTAMP(3),
    "duration" INTEGER,
    "name" TEXT,
    "state" TEXT,
    "details" TEXT,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spotify_activities" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "song_name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT,
    "track_id" TEXT,
    "album_cover_url" TEXT,

    CONSTRAINT "spotify_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaming_activities" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "game_name" TEXT NOT NULL,
    "is_competitive" BOOLEAN NOT NULL DEFAULT false,
    "party_size" INTEGER,
    "party_max_size" INTEGER,
    "platform_id" TEXT,

    CONSTRAINT "gaming_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "other_activities" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "activity_type" INTEGER NOT NULL,
    "url" TEXT,
    "application_id" TEXT,
    "emoji" TEXT,

    CONSTRAINT "other_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "presences_user_id_guild_id_idx" ON "presences"("user_id", "guild_id");

-- CreateIndex
CREATE INDEX "presences_timestamp_idx" ON "presences"("timestamp");

-- CreateIndex
CREATE INDEX "activities_type_idx" ON "activities"("type");

-- CreateIndex
CREATE INDEX "activities_session_start_session_end_idx" ON "activities"("session_start", "session_end");

-- CreateIndex
CREATE UNIQUE INDEX "spotify_activities_activity_id_key" ON "spotify_activities"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "gaming_activities_activity_id_key" ON "gaming_activities"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "other_activities_activity_id_key" ON "other_activities"("activity_id");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_presence_id_fkey" FOREIGN KEY ("presence_id") REFERENCES "presences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spotify_activities" ADD CONSTRAINT "spotify_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaming_activities" ADD CONSTRAINT "gaming_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_activities" ADD CONSTRAINT "other_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
