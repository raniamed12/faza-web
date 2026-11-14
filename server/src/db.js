import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.FAZA_DATA_DIR || path.join(here, "..", "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export function openDb(file = path.join(DATA_DIR, "faza.db")) {
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

// Schéma relationnel : 14 tables.
// users 1—N programs 1—N program_items N—1 places N—1 governorates
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','organizer','admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS governorates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  region TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  tagline TEXT NOT NULL,
  scene TEXT NOT NULL DEFAULT 'medina'
);
CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  governorate_id INTEGER NOT NULL REFERENCES governorates(id),
  category TEXT NOT NULL CHECK (category IN ('sleep','eat','do','discover')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  lat REAL,
  lng REAL,
  precision TEXT NOT NULL DEFAULT 'ville' CHECK (precision IN ('exact','quartier','ville')),
  price REAL NOT NULL DEFAULT 0,
  tags TEXT NOT NULL DEFAULT '[]',
  scene TEXT NOT NULL DEFAULT 'medina',
  image TEXT,
  instagram TEXT,
  facebook TEXT,
  website TEXT,
  hours TEXT,
  closed_day INTEGER NOT NULL DEFAULT -1,
  price_factor REAL,
  palette TEXT,
  map_x REAL,
  map_y REAL,
  is_gem INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'team' CHECK (source IN ('team','demo','community')),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved','pending','rejected')),
  author_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_places_gov ON places(governorate_id, category, status);
CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  page INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS place_dishes (
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  dish_id TEXT NOT NULL REFERENCES dishes(id),
  PRIMARY KEY (place_id, dish_id)
);
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dish_id TEXT NOT NULL REFERENCES dishes(id),
  name TEXT NOT NULL,
  price REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  governorate_id INTEGER NOT NULL REFERENCES governorates(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  confirmed INTEGER NOT NULL DEFAULT 0,
  price REAL NOT NULL DEFAULT 0,
  venue TEXT,
  scene TEXT NOT NULL DEFAULT 'medina',
  instagram TEXT,
  facebook TEXT,
  link TEXT
);
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, place_id)
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  photo TEXT,
  hidden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS place_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  governorate_id INTEGER NOT NULL REFERENCES governorates(id),
  title TEXT NOT NULL,
  budget REAL NOT NULL,
  days INTEGER NOT NULL,
  participants INTEGER NOT NULL,
  prefs TEXT NOT NULL DEFAULT '[]',
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','shared')),
  share_code TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS program_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  place_id INTEGER NOT NULL REFERENCES places(id),
  day INTEGER NOT NULL,
  slot TEXT NOT NULL,
  cost REAL NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  badge TEXT NOT NULL
);
`;

export function migrate(db) {
  db.exec(SCHEMA);
}
