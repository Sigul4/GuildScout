-- CreateTable
CREATE TABLE "Presence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" TEXT,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "presenceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sessionStart" TIMESTAMP(3),
    "sessionEnd" TIMESTAMP(3),
    "duration" INTEGER,
    "name" TEXT,
    "state" TEXT,
    "details" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyActivity" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "songName" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT,
    "trackId" TEXT,
    "albumCoverUrl" TEXT,

    CONSTRAINT "SpotifyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamingActivity" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "isCompetitive" BOOLEAN NOT NULL DEFAULT false,
    "partySize" INTEGER,
    "partyMaxSize" INTEGER,
    "platformId" TEXT,

    CONSTRAINT "GamingActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherActivity" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "activityType" INTEGER NOT NULL,
    "url" TEXT,
    "applicationId" TEXT,
    "emoji" TEXT,

    CONSTRAINT "OtherActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Presence_userId_guildId_idx" ON "Presence"("userId", "guildId");

-- CreateIndex
CREATE INDEX "Presence_timestamp_idx" ON "Presence"("timestamp");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_sessionStart_sessionEnd_idx" ON "Activity"("sessionStart", "sessionEnd");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyActivity_activityId_key" ON "SpotifyActivity"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "GamingActivity_activityId_key" ON "GamingActivity"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "OtherActivity_activityId_key" ON "OtherActivity"("activityId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_presenceId_fkey" FOREIGN KEY ("presenceId") REFERENCES "Presence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyActivity" ADD CONSTRAINT "SpotifyActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamingActivity" ADD CONSTRAINT "GamingActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherActivity" ADD CONSTRAINT "OtherActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
