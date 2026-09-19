import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'giftbro.db');

let dbInstance = null;

/**
 * Ensures data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Persists the in-memory SQLite database to disk
 */
export function saveDatabase() {
  if (!dbInstance) return;
  try {
    ensureDataDir();
    const data = dbInstance.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  } catch (err) {
    console.error('Failed to persist SQLite database to disk:', err);
  }
}

/**
 * Initializes SQLite database and sets up schema
 */
export async function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  ensureDataDir();
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Could not read existing database file, creating new one:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize schema
  initializeSchema(dbInstance);
  saveDatabase();

  return dbInstance;
}

/**
 * Creates tables and indexes if they do not exist
 */
function initializeSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS recipients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      relationship TEXT,
      description TEXT,
      age TEXT,
      budget TEXT,
      occasion TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gifts (
      id TEXT PRIMARY KEY,
      recipient_id TEXT,
      name TEXT NOT NULL,
      price_range TEXT,
      category TEXT,
      reasoning TEXT,
      match_score INTEGER,
      rank INTEGER,
      status TEXT DEFAULT 'suggested',
      batch_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      recipient_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shopping_clicks (
      id TEXT PRIMARY KEY,
      gift_id TEXT,
      gift_name TEXT NOT NULL,
      platform TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_gifts_recipient ON gifts(recipient_id);
    CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
    CREATE INDEX IF NOT EXISTS idx_conv_recipient ON conversations(recipient_id);
    CREATE INDEX IF NOT EXISTS idx_clicks_platform ON shopping_clicks(platform);
  `);
}
