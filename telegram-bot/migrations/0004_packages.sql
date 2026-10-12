-- reel publish packages (Zernio draft + texts, scheduled by one tap), daily stats snapshots, story Zernio ids
CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE, title TEXT,
  zernio_post_id TEXT, video_url TEXT, yt_url TEXT, cover_url TEXT,
  ig_caption TEXT, yt_title TEXT, yt_desc TEXT, gate TEXT, dm TEXT, dm_media TEXT, comment_reply TEXT, telegram TEXT,
  trial INTEGER DEFAULT 0, audio_name INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ready',            -- ready | scheduled | published | parked
  scheduled_for TEXT, automation_id TEXT, telegram_draft_id INTEGER, note TEXT,
  created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS snapshots (
  date TEXT PRIMARY KEY, followers INTEGER, views30 INTEGER, reach30 INTEGER, engaged30 INTEGER, interactions30 INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
ALTER TABLE drafts ADD COLUMN ext TEXT;   -- JSON: Zernio post ids of an auto story
