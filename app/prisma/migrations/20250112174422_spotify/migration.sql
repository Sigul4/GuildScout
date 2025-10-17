-- Step 1: Drop all foreign key constraints first
ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "activities_presence_id_fkey";
ALTER TABLE "other_activities" DROP CONSTRAINT IF EXISTS "other_activities_activity_id_fkey";
ALTER TABLE "spotify_activities" DROP CONSTRAINT IF EXISTS "spotify_activities_activity_id_fkey";
ALTER TABLE "gaming_activities" DROP CONSTRAINT IF EXISTS "gaming_activities_activity_id_fkey";

-- Step 2: Handle primary keys first
-- Presence table primary key
ALTER TABLE "presences" ALTER COLUMN "id" TYPE BIGINT USING CAST("id" AS BIGINT);
ALTER TABLE "presences" ALTER COLUMN "user_id" TYPE BIGINT USING CAST("user_id" AS BIGINT);
ALTER TABLE "presences" ALTER COLUMN "guild_id" TYPE BIGINT USING CAST("guild_id" AS BIGINT);

-- Activities table primary key
ALTER TABLE "activities" ALTER COLUMN "id" TYPE BIGINT USING CAST("id" AS BIGINT);
ALTER TABLE "activities" ALTER COLUMN "presence_id" TYPE BIGINT USING CAST("presence_id" AS BIGINT);

-- Other activities primary key
ALTER TABLE "other_activities" ALTER COLUMN "id" TYPE BIGINT USING CAST("id" AS BIGINT);
ALTER TABLE "other_activities" ALTER COLUMN "activity_id" TYPE BIGINT USING CAST("activity_id" AS BIGINT);

-- Spotify activities primary key
ALTER TABLE "spotify_activities" ALTER COLUMN "id" TYPE BIGINT USING CAST("id" AS BIGINT);
ALTER TABLE "spotify_activities" ALTER COLUMN "activity_id" TYPE BIGINT USING CAST("activity_id" AS BIGINT);

-- Gaming activities primary key
ALTER TABLE "gaming_activities" ALTER COLUMN "id" TYPE BIGINT USING CAST("id" AS BIGINT);
ALTER TABLE "gaming_activities" ALTER COLUMN "activity_id" TYPE BIGINT USING CAST("activity_id" AS BIGINT);

-- Step 3: Recreate foreign key constraints
ALTER TABLE "activities"
    ADD CONSTRAINT "activities_presence_id_fkey"
        FOREIGN KEY ("presence_id")
            REFERENCES "presences"("id");

ALTER TABLE "other_activities"
    ADD CONSTRAINT "other_activities_activity_id_fkey"
        FOREIGN KEY ("activity_id")
            REFERENCES "activities"("id");

ALTER TABLE "spotify_activities"
    ADD CONSTRAINT "spotify_activities_activity_id_fkey"
        FOREIGN KEY ("activity_id")
            REFERENCES "activities"("id");

ALTER TABLE "gaming_activities"
    ADD CONSTRAINT "gaming_activities_activity_id_fkey"
        FOREIGN KEY ("activity_id")
            REFERENCES "activities"("id");

-- Step 4: Recreate indexes if they were dropped
CREATE INDEX IF NOT EXISTS "presences_user_id_guild_id_idx" ON "presences"("user_id", "guild_id");
CREATE INDEX IF NOT EXISTS "presences_timestamp_idx" ON "presences"("timestamp");