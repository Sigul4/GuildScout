-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_presence_id_fkey";

-- DropForeignKey
ALTER TABLE "gaming_activities" DROP CONSTRAINT "gaming_activities_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "other_activities" DROP CONSTRAINT "other_activities_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "spotify_activities" DROP CONSTRAINT "spotify_activities_activity_id_fkey";

-- AlterTable
CREATE SEQUENCE activities_id_seq;
ALTER TABLE "activities" ALTER COLUMN "id" SET DEFAULT nextval('activities_id_seq');
ALTER SEQUENCE activities_id_seq OWNED BY "activities"."id";

-- AlterTable
CREATE SEQUENCE gaming_activities_id_seq;
ALTER TABLE "gaming_activities" ALTER COLUMN "id" SET DEFAULT nextval('gaming_activities_id_seq');
ALTER SEQUENCE gaming_activities_id_seq OWNED BY "gaming_activities"."id";

-- AlterTable
CREATE SEQUENCE other_activities_id_seq;
ALTER TABLE "other_activities" ALTER COLUMN "id" SET DEFAULT nextval('other_activities_id_seq');
ALTER SEQUENCE other_activities_id_seq OWNED BY "other_activities"."id";

-- AlterTable
CREATE SEQUENCE presences_id_seq;
ALTER TABLE "presences" ALTER COLUMN "id" SET DEFAULT nextval('presences_id_seq'),
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "guild_id" SET DATA TYPE TEXT;
ALTER SEQUENCE presences_id_seq OWNED BY "presences"."id";

-- AlterTable
CREATE SEQUENCE spotify_activities_id_seq;
ALTER TABLE "spotify_activities" ALTER COLUMN "id" SET DEFAULT nextval('spotify_activities_id_seq');
ALTER SEQUENCE spotify_activities_id_seq OWNED BY "spotify_activities"."id";

-- CreateTable
CREATE TABLE "SpotifyAuth" (
    "id" BIGSERIAL NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyAuth_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_presence_id_fkey" FOREIGN KEY ("presence_id") REFERENCES "presences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spotify_activities" ADD CONSTRAINT "spotify_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaming_activities" ADD CONSTRAINT "gaming_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_activities" ADD CONSTRAINT "other_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
