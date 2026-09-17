CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_spots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    floor INTEGER NOT NULL,
    spot_number INTEGER NOT NULL,
    spot_type TEXT NOT NULL
        CHECK (spot_type IN ('COMPACT', 'STANDARD', 'EV')),
    is_occupied INTEGER DEFAULT 0,
    UNIQUE(floor, spot_number)
);

CREATE TABLE IF NOT EXISTS parking_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_plate TEXT NOT NULL,
    vehicle_type TEXT NOT NULL
        CHECK (vehicle_type IN ('COMPACT', 'STANDARD', 'EV')),
    spot_id INTEGER NOT NULL,
    check_in_time DATETIME NOT NULL,
    check_out_time DATETIME,
    fee REAL,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'COMPLETED')),
    FOREIGN KEY (spot_id) REFERENCES parking_spots(id)
);

CREATE TABLE IF NOT EXISTS pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    spot_type TEXT NOT NULL UNIQUE
        CHECK (spot_type IN ('COMPACT', 'STANDARD', 'EV')),
    first_hour_rate REAL NOT NULL,
    additional_hour_rate REAL NOT NULL,
    daily_cap REAL NOT NULL
);


INSERT OR IGNORE INTO parking_spots
(floor, spot_number, spot_type)
VALUES
(1, 1, 'COMPACT'),
(1, 2, 'COMPACT'),
(1, 3, 'STANDARD'),
(1, 4, 'STANDARD'),
(1, 5, 'EV'),
(2, 1, 'COMPACT'),
(2, 2, 'STANDARD'),
(2, 3, 'STANDARD'),
(2, 4, 'EV'),
(2, 5, 'EV');

CREATE UNIQUE INDEX IF NOT EXISTS idx_active_license_plate
ON parking_sessions(license_plate)
WHERE status = 'ACTIVE';