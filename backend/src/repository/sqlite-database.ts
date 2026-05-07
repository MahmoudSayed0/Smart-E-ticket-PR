import BetterSqlite3, { Database } from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Singleton SQLite database. Uses better-sqlite3 (synchronous API)
 * so it slots into the existing IEventRepository / ITicketRepository
 * interfaces without converting them to Promise-returning methods.
 *
 * In production the path is /var/data/eticketing.db (Render's persistent disk).
 * Locally it falls back to ./data/eticketing.db inside the backend folder.
 */
let instance: Database | null = null;

export function getDatabase(): Database {
  if (instance) return instance;

  const dbPath =
    process.env.SQLITE_PATH ??
    (process.env.NODE_ENV === 'production'
      ? '/var/data/eticketing.db'
      : path.join(process.cwd(), 'data', 'eticketing.db'));

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new BetterSqlite3(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      venue TEXT NOT NULL,
      event_date TEXT NOT NULL,
      total_capacity INTEGER NOT NULL,
      remaining_capacity INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      subclass_field TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      redeemed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS tickets_event_id_idx ON tickets(event_id);
  `);

  instance = db;
  return db;
}
