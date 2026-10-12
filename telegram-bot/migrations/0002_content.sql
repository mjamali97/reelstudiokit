-- richer ideas (gate, hook, tier, source) and drafts (note, source); kv for job bookkeeping
ALTER TABLE ideas ADD COLUMN gate TEXT;
ALTER TABLE ideas ADD COLUMN hook TEXT;
ALTER TABLE ideas ADD COLUMN tier INTEGER;
ALTER TABLE ideas ADD COLUMN source TEXT;
ALTER TABLE drafts ADD COLUMN note TEXT;
ALTER TABLE drafts ADD COLUMN source TEXT;
CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT, updated_at TEXT DEFAULT (datetime('now')));
