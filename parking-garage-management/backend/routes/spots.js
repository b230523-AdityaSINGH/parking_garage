const express = require("express");
const db = require("../database/database");

const router = express.Router();

router.get("/", (req, res) => {
    const spots = db.prepare(`
        SELECT *
        FROM parking_spots
        ORDER BY floor, spot_number
    `).all();

    res.json(spots);
});

router.get("/available", (req, res) => {
    const type = req.query.type;

    let spots;

    if (type) {
        if (!["COMPACT", "STANDARD", "EV"].includes(type)) {
            return res.status(400).json({
                message: "Invalid spot type"
            });
        }

        spots = db.prepare(`
            SELECT *
            FROM parking_spots
            WHERE is_occupied = 0
            AND spot_type = ?
            ORDER BY floor, spot_number
        `).all(type);
    } else {
        spots = db.prepare(`
            SELECT *
            FROM parking_spots
            WHERE is_occupied = 0
            ORDER BY floor, spot_number
        `).all();
    }

    res.json(spots);
});

module.exports = router;