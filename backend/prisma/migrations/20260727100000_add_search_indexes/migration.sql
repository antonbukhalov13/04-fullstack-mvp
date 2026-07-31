-- Enable pg_trgm extension for ILIKE/contains search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for trigram-based ILIKE search on User fields
CREATE INDEX "User_name_idx" ON "User" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "User_phone_idx" ON "User" USING GIN ("phone" gin_trgm_ops);
