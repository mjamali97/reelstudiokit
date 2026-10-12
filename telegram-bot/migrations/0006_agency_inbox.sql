-- agency mode (clients = Zernio profiles), per-account snapshots, competitors, inbox assistant
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT, profile_id TEXT UNIQUE, name TEXT, token TEXT UNIQUE, join_code TEXT UNIQUE,
  chat_id TEXT, reports INTEGER DEFAULT 1, monthly INTEGER DEFAULT 1, accent TEXT, lang TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS acct_snapshots (
  date TEXT, account_id TEXT, followers INTEGER, views30 INTEGER, reach30 INTEGER, engaged30 INTEGER, interactions30 INTEGER, score INTEGER,
  PRIMARY KEY (date, account_id)
);
CREATE TABLE IF NOT EXISTS competitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER DEFAULT 0, username TEXT, added_at TEXT DEFAULT (datetime('now')),
  UNIQUE (client_id, username)
);
CREATE TABLE IF NOT EXISTS competitor_stats (
  date TEXT, competitor_id INTEGER, followers INTEGER, media_count INTEGER, avg_likes REAL, avg_comments REAL, posts_7d INTEGER, posts_30d INTEGER,
  PRIMARY KEY (date, competitor_id)
);
CREATE TABLE IF NOT EXISTS inbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ev TEXT UNIQUE, kind TEXT, account_id TEXT, client_id INTEGER, post_id TEXT, comment_id TEXT,
  conversation_id TEXT, author TEXT, text TEXT, post_text TEXT, permalink TEXT, suggestion TEXT, reply TEXT, status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS inbox_status ON inbox(status, id);
