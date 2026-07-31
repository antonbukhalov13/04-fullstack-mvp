-- GIN indexes for trigram-based ILIKE search on Application fields
CREATE INDEX "Application_firstName_idx" ON "Application" USING GIN ("firstName" gin_trgm_ops);
CREATE INDEX "Application_lastName_idx" ON "Application" USING GIN ("lastName" gin_trgm_ops);
CREATE INDEX "Application_companyName_idx" ON "Application" USING GIN ("companyName" gin_trgm_ops);
