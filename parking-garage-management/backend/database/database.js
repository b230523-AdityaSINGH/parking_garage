const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const db = new Database(
    path.join(__dirname, "parking.db")
);

db.pragma("foreign_keys = ON");

// Create all tables except pricing seed data
const schema = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf8"
);

db.exec(schema);

// =========================
// PRICING TABLE MIGRATION
// =========================

const pricingColumns = db
    .prepare("PRAGMA table_info(pricing)")
    .all();

const hasSpotTypeColumn = pricingColumns.some(
    (column) => column.name === "spot_type"
);

if (!hasSpotTypeColumn) {
    db.exec(`
        DROP TABLE pricing;

        CREATE TABLE pricing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            spot_type TEXT NOT NULL UNIQUE
                CHECK (spot_type IN ('COMPACT', 'STANDARD', 'EV')),
            first_hour_rate REAL NOT NULL,
            additional_hour_rate REAL NOT NULL,
            daily_cap REAL NOT NULL
        );
    `);
}

// =========================
// DEFAULT PRICING
// =========================

const pricingCount = db
    .prepare("SELECT COUNT(*) AS count FROM pricing")
    .get().count;

if (pricingCount === 0) {
    db.prepare(`
        INSERT INTO pricing
        (spot_type, first_hour_rate, additional_hour_rate, daily_cap)
        VALUES (?, ?, ?, ?)
    `).run("COMPACT", 50, 30, 300);

    db.prepare(`
        INSERT INTO pricing
        (spot_type, first_hour_rate, additional_hour_rate, daily_cap)
        VALUES (?, ?, ?, ?)
    `).run("STANDARD", 50, 30, 300);

    db.prepare(`
        INSERT INTO pricing
        (spot_type, first_hour_rate, additional_hour_rate, daily_cap)
        VALUES (?, ?, ?, ?)
    `).run("EV", 50, 30, 300);
}

// =========================
// ACTIVE PLATE PROTECTION
// =========================

db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_active_license_plate
    ON parking_sessions(license_plate)
    WHERE status = 'ACTIVE';
`);

module.exports = db;