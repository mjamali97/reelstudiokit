-- slow Gemini jobs run from the every-minute cron (webhook background work is cut at ~30 s on the free plan)
CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, arg TEXT, status TEXT DEFAULT 'queued',
  result TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS jobs_status ON jobs(status, id);
