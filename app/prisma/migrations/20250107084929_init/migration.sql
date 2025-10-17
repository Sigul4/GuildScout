-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGINT NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "geo_location" VARCHAR(255),
    "first_seen_at" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" BIGSERIAL NOT NULL,
    "keyword" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "guild_id" BIGINT NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_matches" (
    "id" BIGSERIAL NOT NULL,
    "message_id" BIGINT NOT NULL,
    "channel_id" BIGINT NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "author_id" BIGINT NOT NULL,
    "keyword_id" BIGINT NOT NULL,
    "pre_context" TEXT,
    "post_context" TEXT,
    "matched_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" BIGSERIAL NOT NULL,
    "message_id" BIGINT NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "channel_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "emoji_name" VARCHAR(255) NOT NULL,
    "emoji_id" BIGINT,
    "added_at" TIMESTAMP(3) NOT NULL,
    "removed_at" TIMESTAMP(3),

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "keywords_keyword_key" ON "keywords"("keyword");

-- CreateIndex
CREATE INDEX "reactions_message_id_idx" ON "reactions"("message_id");

-- CreateIndex
CREATE INDEX "reactions_user_id_idx" ON "reactions"("user_id");

-- AddForeignKey
ALTER TABLE "message_matches" ADD CONSTRAINT "message_matches_keyword_id_fkey" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_matches" ADD CONSTRAINT "message_matches_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
