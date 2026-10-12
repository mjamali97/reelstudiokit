-- agency mode: each client's own voice, facts and handle for the inbox assistant (tools/client.mjs sync fills them)
ALTER TABLE clients ADD COLUMN voice TEXT;
ALTER TABLE clients ADD COLUMN facts TEXT;
ALTER TABLE clients ADD COLUMN handle TEXT;
