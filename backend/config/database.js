import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'food_redistribution.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    displayName TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('donor', 'ngo')),
    area TEXT NOT NULL,
    contact TEXT DEFAULT '',
    capacity INTEGER DEFAULT 0,
    availability INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS food_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foodItem TEXT NOT NULL,
    quantity TEXT NOT NULL,
    location TEXT NOT NULL,
    area TEXT NOT NULL,
    pickupTime TEXT NOT NULL,
    status TEXT DEFAULT 'Available' CHECK(status IN ('Available', 'Claimed', 'Expired')),
    donorId INTEGER NOT NULL,
    donorName TEXT NOT NULL,
    imageUrl TEXT DEFAULT '',
    claimedBy INTEGER DEFAULT NULL,
    claimedByName TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donorId) REFERENCES users(id),
    FOREIGN KEY (claimedBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS pickups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foodId INTEGER NOT NULL,
    ngoId INTEGER NOT NULL,
    ngoName TEXT NOT NULL,
    donorId INTEGER NOT NULL,
    foodItem TEXT NOT NULL,
    scheduledTime TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Completed', 'Cancelled')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (foodId) REFERENCES food_listings(id),
    FOREIGN KEY (ngoId) REFERENCES users(id),
    FOREIGN KEY (donorId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    isRead INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_food_status ON food_listings(status);
  CREATE INDEX IF NOT EXISTS idx_food_area ON food_listings(area);
  CREATE INDEX IF NOT EXISTS idx_food_donor ON food_listings(donorId);
  CREATE INDEX IF NOT EXISTS idx_pickups_ngo ON pickups(ngoId);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  CREATE INDEX IF NOT EXISTS idx_users_area ON users(area);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId);
`);

export default db;
