const express = require("express");
const db = require("../database/database");
const calculateFee = require("../utils/feeCalculator");

const router = express.Router();

// =========================
// CHECK-IN
// =========================
router.post("/check-in", (req, res) => {
    try {
        const { licensePlate, vehicleType } = req.body;

        if (!licensePlate || !vehicleType) {
            return res.status(400).json({
                message: "License plate and vehicle type are required"
            });
        }

        const plate = licensePlate.trim().toUpperCase();

        const validTypes = ["COMPACT", "STANDARD", "EV"];

        if (!validTypes.includes(vehicleType)) {
            return res.status(400).json({
                message: "Invalid vehicle type"
            });
        }

        const activeVehicle = db.prepare(`
            SELECT id
            FROM parking_sessions
            WHERE license_plate = ?
            AND status = 'ACTIVE'
        `).get(plate);

        if (activeVehicle) {
            return res.status(409).json({
                message: "Vehicle is already parked"
            });
        }

        const spot = db.prepare(`
            SELECT *
            FROM parking_spots
            WHERE is_occupied = 0
            AND spot_type = ?
            ORDER BY floor, spot_number
            LIMIT 1
        `).get(vehicleType);

        if (!spot) {
            return res.status(409).json({
                message: "No compatible parking spot available"
            });
        }

        const checkInTime = new Date().toISOString();

        const transaction = db.transaction(() => {
            db.prepare(`
                UPDATE parking_spots
                SET is_occupied = 1
                WHERE id = ?
            `).run(spot.id);

            return db.prepare(`
                INSERT INTO parking_sessions
                (
                    license_plate,
                    vehicle_type,
                    spot_id,
                    check_in_time
                )
                VALUES (?, ?, ?, ?)
            `).run(
                plate,
                vehicleType,
                spot.id,
                checkInTime
            );
        });

        const result = transaction();

        res.status(201).json({
            message: "Vehicle checked in successfully",
            sessionId: result.lastInsertRowid,
            licensePlate: plate,
            spot: {
                id: spot.id,
                floor: spot.floor,
                spotNumber: spot.spot_number,
                type: spot.spot_type
            },
            checkInTime
        });

    } catch (error) {
        res.status(500).json({
            message: "Check-in failed",
            error: error.message
        });
    }
});


// =========================
// CHECK-OUT
// =========================
router.post("/check-out", (req, res) => {
    try {
        const { licensePlate } = req.body;

        if (!licensePlate) {
            return res.status(400).json({
                message: "License plate is required"
            });
        }

        const plate = licensePlate.trim().toUpperCase();

        const session = db.prepare(`
            SELECT
                ps.*,
                s.floor,
                s.spot_number,
                s.spot_type
            FROM parking_sessions ps
            JOIN parking_spots s
                ON ps.spot_id = s.id
            WHERE ps.license_plate = ?
            AND ps.status = 'ACTIVE'
        `).get(plate);

        if (!session) {
            return res.status(404).json({
                message: "No active parking session found"
            });
        }

        const checkOutTime = new Date().toISOString();

        const pricing = db.prepare(`
            SELECT *
            FROM pricing
            WHERE spot_type = ?
        `).get(session.spot_type);

        if (!pricing) {
            return res.status(500).json({
                message: "Pricing configuration not found"
            });
        }

        const { hours, fee } = calculateFee(
            session.check_in_time,
            checkOutTime,
            pricing
        );

        const transaction = db.transaction(() => {
            db.prepare(`
                UPDATE parking_sessions
                SET check_out_time = ?,
                    fee = ?,
                    status = 'COMPLETED'
                WHERE id = ?
            `).run(
                checkOutTime,
                fee,
                session.id
            );

            db.prepare(`
                UPDATE parking_spots
                SET is_occupied = 0
                WHERE id = ?
            `).run(session.spot_id);
        });

        transaction();

        res.json({
            message: "Vehicle checked out successfully",
            licensePlate: plate,
            durationHours: hours,
            fee,
            spot: {
                floor: session.floor,
                spotNumber: session.spot_number
            },
            checkInTime: session.check_in_time,
            checkOutTime
        });

    } catch (error) {
        res.status(500).json({
            message: "Check-out failed",
            error: error.message
        });
    }
});


// =========================
// TRANSFER ACTIVE SESSION
// =========================
// Valet hand-off:
// old plate -> new plate
// Spot and check-in time remain unchanged.
router.post("/transfer", (req, res) => {
    try {
        const { currentPlate, newPlate } = req.body;

        if (!currentPlate || !newPlate) {
            return res.status(400).json({
                message: "Current plate and new plate are required"
            });
        }

        const oldPlate = currentPlate.trim().toUpperCase();
        const updatedPlate = newPlate.trim().toUpperCase();

        if (oldPlate === updatedPlate) {
            return res.status(400).json({
                message: "New plate must be different from current plate"
            });
        }

        const session = db.prepare(`
            SELECT
                ps.*,
                s.floor,
                s.spot_number,
                s.spot_type
            FROM parking_sessions ps
            JOIN parking_spots s
                ON ps.spot_id = s.id
            WHERE ps.license_plate = ?
            AND ps.status = 'ACTIVE'
        `).get(oldPlate);

        if (!session) {
            return res.status(404).json({
                message: "No active session found for current plate"
            });
        }

        const existingVehicle = db.prepare(`
            SELECT id
            FROM parking_sessions
            WHERE license_plate = ?
            AND status = 'ACTIVE'
        `).get(updatedPlate);

        if (existingVehicle) {
            return res.status(409).json({
                message: "New plate already has an active parking session"
            });
        }

        db.prepare(`
            UPDATE parking_sessions
            SET license_plate = ?
            WHERE id = ?
        `).run(
            updatedPlate,
            session.id
        );

        res.json({
            message: "Parking session transferred successfully",
            sessionId: session.id,
            previousLicensePlate: oldPlate,
            licensePlate: updatedPlate,
            spot: {
                id: session.spot_id,
                floor: session.floor,
                spotNumber: session.spot_number,
                type: session.spot_type
            },
            checkInTime: session.check_in_time
        });

    } catch (error) {
        res.status(500).json({
            message: "Transfer failed",
            error: error.message
        });
    }
});


// =========================
// ACTIVE PARKING SESSIONS
// =========================
router.get("/active", (req, res) => {
    try {
        const sessions = db.prepare(`
            SELECT
                ps.id,
                ps.license_plate,
                ps.vehicle_type,
                ps.check_in_time,
                s.floor,
                s.spot_number,
                s.spot_type
            FROM parking_sessions ps
            JOIN parking_spots s
                ON ps.spot_id = s.id
            WHERE ps.status = 'ACTIVE'
            ORDER BY ps.check_in_time DESC
        `).all();

        res.json(sessions);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch active sessions",
            error: error.message
        });
    }
});


// =========================
// SEARCH BY LICENSE PLATE
// =========================
router.get("/search", (req, res) => {
    try {
        const plate = req.query.plate;

        if (!plate) {
            return res.status(400).json({
                message: "Plate number is required"
            });
        }

        const results = db.prepare(`
            SELECT
                ps.*,
                s.floor,
                s.spot_number,
                s.spot_type
            FROM parking_sessions ps
            JOIN parking_spots s
                ON ps.spot_id = s.id
            WHERE ps.license_plate LIKE ?
            ORDER BY ps.check_in_time DESC
        `).all(`%${plate.trim().toUpperCase()}%`);

        res.json(results);

    } catch (error) {
        res.status(500).json({
            message: "Search failed",
            error: error.message
        });
    }
});


// =========================
// PARKING HISTORY
// =========================
router.get("/history", (req, res) => {
    try {
        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                parseInt(req.query.limit) || 10,
                1
            ),
            100
        );

        const allowedSorts = {
            check_in_time: "ps.check_in_time",
            check_out_time: "ps.check_out_time",
            license_plate: "ps.license_plate",
            fee: "ps.fee"
        };

        const sort =
            allowedSorts[req.query.sort] ||
            "ps.check_in_time";

        const order =
            req.query.order === "asc"
                ? "ASC"
                : "DESC";

        const offset = (page - 1) * limit;

        const total = db.prepare(`
            SELECT COUNT(*) AS count
            FROM parking_sessions
        `).get().count;

        const sessions = db.prepare(`
            SELECT
                ps.id,
                ps.license_plate,
                ps.vehicle_type,
                ps.check_in_time,
                ps.check_out_time,
                ps.fee,
                ps.status,
                s.floor,
                s.spot_number
            FROM parking_sessions ps
            JOIN parking_spots s
                ON ps.spot_id = s.id
            ORDER BY ${sort} ${order}
            LIMIT ? OFFSET ?
        `).all(limit, offset);

        res.json({
            data: sessions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(
                    total / limit
                )
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch parking history",
            error: error.message
        });
    }
});


module.exports = router;