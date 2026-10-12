CREATE TABLE IF NOT EXISTS ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT, kind TEXT NOT NULL, title TEXT, summary TEXT, note TEXT,
  tag TEXT, starred INTEGER DEFAULT 0, score REAL, status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ideas_status ON ideas(status, created_at);
CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,            -- telegram | news | story | story_manual | reel | carousel
  title TEXT, body TEXT, media_url TEXT,
  status TEXT DEFAULT 'draft',   -- draft | scheduled | published | rejected
  scheduled_for TEXT,            -- UTC ISO
  result TEXT,                   -- last publish result / Zernio response
  created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS drafts_status ON drafts(status, scheduled_for);
CREATE TABLE IF NOT EXISTS state (chat_id TEXT PRIMARY KEY, mode TEXT, ref INTEGER, updated_at TEXT DEFAULT (datetime('now')));
