-- CreateIndex
-- GIN Index for JSONB preferences field (for fast filtering by user preferences)
CREATE INDEX IF NOT EXISTS "User_preferences_gin_idx" ON "User" USING GIN ("preferences");

-- Standard B-tree indexes (already defined in schema but ensuring they exist)
CREATE INDEX IF NOT EXISTS "Conversation_sentimentScore_idx" ON "Conversation" ("sentimentScore");
CREATE INDEX IF NOT EXISTS "Product_tags_idx" ON "Product" USING GIN ("tags");
